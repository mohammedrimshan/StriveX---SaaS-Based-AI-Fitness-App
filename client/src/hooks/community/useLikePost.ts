import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost } from "@/services/client/clientService";
import { IPost } from "@/types/Post";
import { useSocket } from "@/context/socketContext";

interface LikePostArgs {
  id: string;
  role: string;
  userId: string;
}

interface PreviousPostsContext {
  previousPosts?: { items: IPost[] };
  previousPost?: IPost;
}

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const mutation = useMutation<IPost, Error, LikePostArgs, PreviousPostsContext>({
    mutationFn: ({ id, role }) => likePost(id, role),

    onMutate: async ({ id, userId }) => {
      console.log("[DEBUG] Initiating optimistic update for likePost:", { id, userId });

      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", id] });

      const previousPosts = queryClient.getQueryData<{ items: IPost[] }>(["posts"]);
      const previousPost = queryClient.getQueryData<IPost>(["post", id]);

      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        const updated = {
          ...old,
          items: old.items.map((post: IPost) =>
            post.id === id
              ? {
                  ...post,
                  likes: post.likes.includes(userId)
                    ? post.likes.filter((uid: string) => uid !== userId)
                    : [...post.likes, userId],
                  hasLiked: !post.likes.includes(userId),
                }
              : post
          ),
        };
        console.log("[DEBUG] Optimistic posts update:", updated.items.find((p: IPost) => p.id === id));
        return updated;
      });

      queryClient.setQueryData(["post", id], (old: IPost | undefined) => {
        if (!old) return old;
        const updated = {
          ...old,
          likes: old.likes.includes(userId)
            ? old.likes.filter((uid: string) => uid !== userId)
            : [...old.likes, userId],
          hasLiked: !old.likes.includes(userId),
        };
        console.log("[DEBUG] Optimistic single post update:", updated);
        return updated;
      });

      return { previousPosts, previousPost };
    },

    onSuccess: (updatedPost, { id, userId, role }) => {
      console.log("[DEBUG] Like post success:", { id, userId, updatedPost });

      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        const updated = {
          ...old,
          items: old.items.map((post: IPost) =>
            post.id === id
              ? { ...updatedPost, hasLiked: updatedPost.likes.includes(userId) }
              : post
          ),
        };
        console.log("[DEBUG] Updated posts cache on success:", updated.items.find((p: IPost) => p.id === id));
        return updated;
      });

      queryClient.setQueryData(["post", id], {
        ...updatedPost,
        hasLiked: updatedPost.likes.includes(userId),
      });

      if (socket && isConnected) {
        console.log("[DEBUG] Emitting likePost:", { postId: id, userId, role, likes: updatedPost.likes });
        socket.emit("likePost", { postId: id, userId, role, likes: updatedPost.likes }, (ack: any) => {
          if (ack?.error) {
            console.error("[DEBUG] likePost acknowledgment error:", ack.error);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", id] });
          } else {
            console.log("[DEBUG] likePost acknowledgment:", ack);
          }
        });
      } else {
        console.warn("[DEBUG] Socket not connected, invalidating queries as fallback", { id });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["post", id] });
      }
    },

    onError: (error, { id }, context) => {
      console.error("[DEBUG] Like post error:", {
        message: error.message,
        stack: error.stack,
      });

      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", id], context.previousPost);
      }

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },

    retry: (failureCount, error) => {
      if (error.message.includes("Post not found")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    likePost: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};