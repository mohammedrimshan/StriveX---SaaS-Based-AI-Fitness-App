import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IPostEntity, ICommentEntity } from "./index";
import CommentList from "./CommentList";
import CommentForm from "./CommentForum";


interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: IPostEntity | null;
}
const DEFAULT_COMMENTS: ICommentEntity[] = [];

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
const [comments, setComments] = useState<ICommentEntity[]>(
  post ? DEFAULT_COMMENTS.filter((comment) => comment.postId === post.id) : []
);

  if (!post) {
    throw new Error("Post is required to determine the role");
  }
  const role = post.author?.role || post.role;
  if (!role) {
    throw new Error("Unable to determine the role");
  }
  const handleAddComment = (postId: string, comment: string) => {
    const newComment: ICommentEntity = {
      id: `c${Date.now()}`,
      postId,
      authorId: "user1",
      role,
      textContent: comment,
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      reports: [],
      author: {
        _id: "user1",
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex@fitness.com",
        profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    };

    setComments([newComment, ...comments]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        {post && (
          <div className="space-y-4">
            <CommentList comments={comments} />
            <CommentForm postId={post.id || ""} onSubmit={handleAddComment} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;
