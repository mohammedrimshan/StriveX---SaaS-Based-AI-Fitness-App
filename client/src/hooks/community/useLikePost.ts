import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost } from "@/services/client/clientService";
import { IPost } from "@/types/Post";
import { useSocket } from "@/context/socketContext";

interface LikePostArgs {
  id: string;
  role: string;
  userId: string;
}

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const mutation = useMutation<IPost, Error, LikePostArgs>({
    mutationFn: ({ id, role }) => likePost(id, role),
    onMutate: async ({ id, userId }) => {
      console.log("[DEBUG] Initiating optimistic update for likePost:", { id, userId });
      await queryClient.cancelQueries(['posts']);
      const previousPosts = queryClient.getQueryData(['posts']);
      queryClient.setQueryData(['posts'], (old: any) => {
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
      queryClient.setQueryData(['post', id], (old: IPost | undefined) => {
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
      return { previousPosts };
    },
    onSuccess: (updatedPost, { id, userId, role }) => {
      console.log("[DEBUG] Like post success:", { id, userId, updatedPost });
      queryClient.setQueryData(['posts'], (old: any) => {
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
      queryClient.setQueryData(['post', id], {
        ...updatedPost,
        hasLiked: updatedPost.likes.includes(userId),
      });
      if (socket && isConnected) {
        console.log("[DEBUG] Emitting likePost:", { postId: id, userId, role });
        socket.emit("likePost", { postId: id, userId, role }, (ack: any) => {
          console.log("[DEBUG] likePost acknowledgment:", ack);
        });
      } else {
        console.warn("[DEBUG] Socket not connected, invalidating posts query as fallback");
        queryClient.invalidateQueries(['posts']);
      }
    },
    onError: (error, { id }, context) => {
      console.error("[DEBUG] Like post error:", error.message);
      queryClient.setQueryData(['posts'], context?.previousPosts);
      queryClient.invalidateQueries(['post', id]);
      console.log("[DEBUG] Reverted to previous posts state and invalidated post query:", { id });
    },
  });

  return {
    likePost: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};