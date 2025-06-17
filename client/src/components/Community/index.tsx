import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import CreatePostForm from "./CreatePostForm";
import PostCard from "./PostCard";
import PostDetailDrawer from "./PostDetialDrawer";
import { useGetPosts } from "@/hooks/community/useGetPosts";
import { useCreatePost } from "@/hooks/community/useCreatePost";
import { useLikePost } from "@/hooks/community/useLikePost";
import { selectCurrentUser } from "@/store/userSelectors";
import AnimatedBackground from "../Animation/AnimatedBackgorund";
import type { IPost, PaginatedPostsResponse, UserRole } from "@/types/Post";
import type { WorkoutType } from "@/types/Consts";
import { useSocket } from "@/context/socketContext";
import { useQueryClient } from "@tanstack/react-query";

const Community = ({ userId }: { userId: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState<IPost[]>([]);
  const [pendingLikes, setPendingLikes] = useState<Record<string, boolean>>({});
  const currentUser = useSelector(selectCurrentUser);
  const { socket, posts: socketPosts, isConnected } = useSocket();

  const {
    posts: fetchedPosts,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPosts({
    category: undefined,
  });
  const { createPost, isCreating } = useCreatePost();
  const { likePost } = useLikePost();




useEffect(() => {
  const el = containerRef.current;
  if (!el) return;

  if (isPostDetailOpen) {
    el.setAttribute("inert", "");
  } else {
    el.removeAttribute("inert");
  }
}, [isPostDetailOpen]);
  useEffect(() => {
    const postMap = new Map<string, IPost>();
    const cachedPosts =
      queryClient.getQueryData<PaginatedPostsResponse>([
        "posts",
        { category: undefined, sortBy: "latest", skip: 0, limit: 10 },
      ])?.items || [];
    cachedPosts.forEach((post) => postMap.set(post.id, post));
    socketPosts.forEach((socketPost) => postMap.set(socketPost.id, socketPost));
    const combinedPosts = Array.from(postMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setDisplayedPosts(combinedPosts);
  }, [fetchedPosts, socketPosts, queryClient]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newPost", (post: IPost) => {
      console.log("[DEBUG] New post received:", post);
      queryClient.setQueryData(
        ["posts"],
        (old: { items: IPost[]; total: number } | undefined) => {
          if (!old) return { items: [post], total: 1 };
          return {
            ...old,
            items: [post, ...old.items],
            total: old.total + 1,
          };
        }
      );
    });

    socket.on("postDeleted", ({ postId }: { postId: string }) => {
      console.log("[DEBUG] Post deleted:", postId);
      setDisplayedPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId)
      );
    });

    return () => {
      socket.off("newPost");
      socket.off("postDeleted");
    };
  }, [socket, queryClient]);

  const handleCreatePost = async (post: {
    textContent: string;
    category: WorkoutType;
    mediaUrl?: string;
  }) => {
    if (!currentUser?.role) {
      toast.error("Please log in to create a post");
      return;
    }

    try {
      await createPost(
        {
          textContent: post.textContent,
          mediaUrl: post.mediaUrl,
          role: currentUser.role as UserRole,
        },
        {
          onSuccess: () => {
            toast.success("Post created successfully");
            refetch();
          },
          onError: (error: any) => {
            toast.error(
              "Failed to create post: " + (error.message || "Unknown error")
            );
          },
        }
      );
    } catch (error) {
      console.error("[DEBUG] Error in handleCreatePost:", error);
    }
  };

  const handlePostClick = (postId: string) => {
    console.log("[DEBUG] Post clicked:", postId);
    const post = displayedPosts.find((p) => p.id === postId) || null;
    if (post) {
      setSelectedPost(post);
      setIsPostDetailOpen(true);
    } else {
      console.error("[DEBUG] Post not found:", postId);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!socket || !isConnected || !currentUser?.id) {
      toast.error("Socket not connected or user not authenticated");
      return;
    }
    try {
      setPendingLikes((prev) => ({ ...prev, [postId]: true }));
      await likePost({
        id: postId,
        role: currentUser.role,
        userId: currentUser.id,
      });
      setPendingLikes((prev) => {
        const newPending = { ...prev };
        delete newPending[postId];
        return newPending;
      });
    } catch (error) {
      console.error("[DEBUG] Error in handleLikePost:", error);
      toast.error("Failed to update like status");
      setPendingLikes((prev) => {
        const newPending = { ...prev };
        delete newPending[postId];
        return newPending;
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading posts: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-[#0095F6] text-white rounded-lg hover:bg-[#0095F6]/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <div
        ref={containerRef}
        className="min-h-screen flex flex-col mt-10"
        suppressHydrationWarning={true}
      >
        <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-10">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="text-xl font-bold italic">FitGram</h1>
            <div className="flex items-center space-x-4">
              <button className="text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-0 max-w-lg pb-16 pt-14">
          <div className="px-4">
            <CreatePostForm
              onSubmit={handleCreatePost}
              isLoading={isCreating}
            />

            {(isLoading || isFetching) && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0095F6]"></div>
              </div>
            )}

            {!isLoading && displayedPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No posts found in this category.
                </p>
                <p className="text-gray-500 mt-2">
                  Be the first to share something!
                </p>
              </div>
            )}

            {!isLoading && displayedPosts.length > 0 && (
              <div className="space-y-4">
                {displayedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      ...post,
                      content: post.textContent,
                      createdAt: post.createdAt,
                      updatedAt: post.updatedAt,
                      author: post.author
                        ? { ...post.author, id: post.authorId }
                        : undefined,
                    }}
                    onComment={handlePostClick}
                    onLike={() => handleLikePost(post.id)}
                    isLiking={!!pendingLikes[post.id]}
                    currentUserId={userId}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <PostDetailDrawer
          post={selectedPost}
          isOpen={isPostDetailOpen}
          onClose={() => setIsPostDetailOpen(false)}
          onLike={handleLikePost}
          isLiking={selectedPost ? !!pendingLikes[selectedPost.id] : false}
        />
      </div>
    </AnimatedBackground>
  );
};

export default Community;
