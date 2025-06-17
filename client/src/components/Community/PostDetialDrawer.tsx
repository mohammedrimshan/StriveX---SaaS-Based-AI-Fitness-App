import React from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { IPost, IComment } from "@/types/Post";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CommentList from "./CommentList";
import CommentForm from "./CommentForum";
import { selectCurrentUser } from "@/store/userSelectors";
import { useGetPost } from "@/hooks/community/useGetPost";
import { useLikePost } from "@/hooks/community/useLikePost";
import { useCreateComment } from "@/hooks/community/useCreateComment";
import { useGetComments } from "@/hooks/community/useGetComments";
import { X, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface PostDetailDrawerProps {
  post: IPost | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (postId: string) => Promise<void>;
  isLiking: boolean;
}

const PostDetailDrawer: React.FC<PostDetailDrawerProps> = ({ post, isOpen, onClose, onLike, isLiking }) => {
  const currentUser = useSelector(selectCurrentUser);
  const [isSaved, setIsSaved] = React.useState(false);
  const { post: fetchedPost, isLoading: postLoading, error: postError } = useGetPost(post?.id || "");
  const { likePost, isPending } = useLikePost();
  const { createComment, isCreating: isCreatingComment } = useCreateComment();
  const { comments: rawComments, isLoading: commentsLoading, error: commentsError } = useGetComments(post?.id || "");

  const comments: IComment[] = rawComments.map((comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
    updatedAt: new Date(comment.updatedAt),
    role: comment.author?.role || "client",
  }));

  const displayPost = React.useMemo(() => {
    if (!post) return null;
    if (fetchedPost) {
      return {
        ...post,
        ...Object.fromEntries(
          Object.entries(fetchedPost).filter(([_, value]) => value !== null && value !== undefined)
        ),
      };
    }
    return post;
  }, [post, fetchedPost]);

  const handleLike = () => {
    if (!currentUser?.role || !currentUser?.id) {
      toast.error("Please log in to like posts");
      return;
    }
    if (displayPost?.id) {
      likePost(
        { id: displayPost.id, role: currentUser.role, userId: currentUser.id },
        {
          onSuccess: () => toast.success(displayPost.hasLiked ? "Post unliked" : "Post liked"),
          onError: (err) => toast.error(err.message || "Failed to like post"),
        }
      );
      onLike(displayPost.id);
    }
  };

  const handleAddComment = (postId: string, textContent: string) => {
    if (!currentUser?.role) {
      toast.error("Please log in to comment");
      return;
    }
    createComment(
      { postId, textContent, role: currentUser.role },
      {
        onSuccess: () => toast.success("Comment added"),
        onError: (err) => toast.error(err.message || "Failed to add comment"),
      }
    );
  };

  if (!isOpen || !post?.id) {
    return null;
  }

  if (!displayPost) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] p-0 rounded-t-xl">
          <VisuallyHidden asChild>
            <DrawerTitle>Post Not Found</DrawerTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-black">
              <X className="h-6 w-6" />
            </Button>
            <h2 className="text-lg font-semibold">Post</h2>
            <div className="w-6"></div>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500">Post not found</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  const hasMedia = !!displayPost.mediaUrl;
  const hasLiked = displayPost.hasLiked || (currentUser?.id && displayPost.likes?.includes(currentUser.id)) || false;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const formatTimeAgo = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return "Some time ago";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "Some time ago";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("[DEBUG] Invalid date format:", dateStr, error);
      return "Some time ago";
    }
  };

  const authorName =
    displayPost.author?.firstName && displayPost.author?.lastName
      ? `${displayPost.author.firstName} ${displayPost.author.lastName}`.trim()
      : "Anonymous";

  if (postError && !displayPost) {
    console.error("[DEBUG] Post error:", postError);
    toast.error(postError.message || "Failed to load post details");
  }
  if (commentsError) {
    console.error("[DEBUG] Comments error:", commentsError);
    toast.error(commentsError.message || "Failed to load comments");
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] p-0 rounded-t-xl">
        <VisuallyHidden asChild>
          <DrawerTitle>Post Details</DrawerTitle>
        </VisuallyHidden>
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-black">
            <X className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-semibold">Post</h2>
          <div className="w-6"></div>
        </div>
        {postLoading && !displayPost ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0095F6]"></div>
            <p className="mt-2 text-gray-500">Loading post details...</p>
          </div>
        ) : (
          <div className={`flex flex-col ${hasMedia ? "md:flex-row" : ""} h-full max-h-[calc(90vh-56px)]`}>
            {hasMedia && (
              <div className="md:w-1/2 md:max-h-full h-[350px] md:h-auto bg-black flex items-center justify-center">
                <img
                  src={displayPost.mediaUrl || "/placeholder.svg"}
                  alt="Post media"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className={`flex flex-col ${hasMedia ? "md:w-1/2" : "w-full"} max-h-full`}>
              <div className="flex items-center p-4 border-b">
                <Avatar className="h-8 w-8 mr-3 border border-gray-200">
                  {displayPost.author?.profileImage ? (
                    <AvatarImage
                      src={displayPost.author.profileImage}
                      alt={authorName}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium">
                      {getInitials(authorName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-sm">{authorName}</h3>
                    {displayPost.role === "trainer" && (
                      <svg
                        className="w-3 h-3 ml-1 text-[#0095F6] fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{displayPost.category}</p>
                </div>
              </div>
              <div className="p-4 border-b">
                <p className="text-sm">{displayPost.textContent}</p>
              </div>
              <div className="flex justify-between p-4 border-b">
                <div className="flex space-x-4">
                  <button onClick={handleLike} className="text-black focus:outline-none" disabled={isPending || isLiking}>
                    <Heart
                      className={`h-6 w-6 ${hasLiked ? "fill-red-500 text-red-500" : "fill-none"}`}
                      strokeWidth={hasLiked ? 0 : 2}
                    />
                  </button>
                  <button className="text-black focus:outline-none">
                    <MessageCircle className="h-6 w-6 fill-none" />
                  </button>
                  <button className="text-black focus:outline-none">
                    <Send className="h-6 w-6 fill-none" />
                  </button>
                </div>
                <button onClick={() => setIsSaved(!isSaved)} className="text-black focus:outline-none">
                  <Bookmark className={`h-6 w-6 ${isSaved ? "fill-black" : "fill-none"}`} />
                </button>
              </div>
              <div className="px-4 pt-2">
                <p className="text-sm font-semibold">{displayPost.likes?.length || 0} likes</p>
                <p className="text-xs text-gray-400 uppercase mt-1">{formatTimeAgo(displayPost.createdAt)}</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {commentsLoading ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <p className="text-sm">Loading comments...</p>
                  </div>
                ) : comments?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <p className="text-sm mb-1">No comments yet.</p>
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="py-2">
                    <CommentList comments={comments} />
                  </div>
                )}
              </div>
              <div className="p-4 border-t sticky bottom-0 bg-white mt-auto">
                <CommentForm
                  postId={displayPost.id || ""}
                  onSubmit={handleAddComment}
                  disabled={isCreatingComment}
                />
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PostDetailDrawer;