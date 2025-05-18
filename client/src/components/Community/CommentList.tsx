"use client"

import type React from "react"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart } from "lucide-react"
import type { ICommentEntity } from "./index"
import { selectCurrentUser } from "@/store/userSelectors"
import { useLikeComment } from "@/hooks/community/useLikeComment"
import { useReportComment } from "@/hooks/community/useReportComment"

interface CommentListProps {
  comments: ICommentEntity[]
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const currentUser = useSelector(selectCurrentUser)
  const { likeComment, isLiking } = useLikeComment()
  const { reportComment, isReporting } = useReportComment()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const handleLikeComment = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (currentUser?.role) {
      likeComment(
        { id: commentId, role: currentUser.role },
        {
          onSuccess: () => toast.success("Comment liked"),
          onError: (err) => toast.error(err.message || "Failed to like comment"),
        },
      )
    } else {
      toast.error("Please log in to like comments")
    }
  }

  const handleReportComment = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (currentUser?.role) {
      reportComment(
        { id: commentId, reason: "Inappropriate content", role: currentUser.role },
        {
          onSuccess: () => toast.success("Comment reported"),
          onError: (err) => toast.error(err.message || "Failed to report comment"),
        },
      )
    } else {
      toast.error("Please log in to report comments")
    }
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
        <p className="text-sm mb-1">No comments yet.</p>
        <p className="text-sm">Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0 border border-gray-200">
            {comment.author?.profileImage ? (
              <AvatarImage
                src={comment.author.profileImage || "/placeholder.svg"}
                alt={comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : "User"}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                {comment.author ? getInitials(comment.author.firstName, comment.author.lastName) : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">
                {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : "Unknown User"}
              </span>{" "}
              {comment.textContent}
            </p>
            <div className="flex items-center mt-1 space-x-3 text-xs">
              <span className="text-gray-500">{formatTimeAgo(new Date(comment.createdAt))}</span>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => comment.id && handleLikeComment(comment.id, e)}
                disabled={isLiking}
              >
                {comment.likes.length > 0 ? `${comment.likes.length} likes` : "Like"}
              </button>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => handleReportComment(comment.id ?? "", e)}
                disabled={isReporting}
              >
                Report
              </button>
            </div>
          </div>
          <button
            onClick={(e) => handleLikeComment(comment.id ?? "", e)}
            disabled={isLiking}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                comment.likes.includes(currentUser?.id || "") ? "fill-red-500 text-red-500" : "fill-none"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

export default CommentList
