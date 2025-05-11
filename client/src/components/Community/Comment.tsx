"use client"

import { Heart, Reply, Trash2 } from "lucide-react"
import type { Comment as CommentType, User } from "./index"
import UserAvatar from "./UserAvatar"
import TimeDisplay from "./TimeDisplay"
import { Button } from "../ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLikeComment, useDeleteComment } from "@/hooks/community/useCommunity"
import { motion } from "framer-motion"

interface CommentProps {
  comment: CommentType
  onLike?: (id: string) => void
  onDelete?: (id: string) => void
  isCurrentUserComment?: boolean
  currentUser?: User | null
}

const Comment = ({ comment, onLike, onDelete, isCurrentUserComment = false, currentUser }: CommentProps) => {
  const [liked, setLiked] = useState(comment.hasLiked)
  const [likeCount, setLikeCount] = useState(comment.likes)
  const likeCommentMutation = useLikeComment()
  const deleteCommentMutation = useDeleteComment()

  const handleLike = () => {
    if (!currentUser) return
    const newLikedState = !liked
    setLiked(newLikedState)
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1))
    likeCommentMutation.mutate(comment.id, {
      onError: () => {
        setLiked(liked)
        setLikeCount(likeCount)
      },
    })
    if (onLike) onLike(comment.id)
  }

  const handleDelete = () => {
    if (isCurrentUserComment && onDelete) {
      deleteCommentMutation.mutate(comment.id)
      onDelete(comment.id)
    }
  }

  return (
    <motion.div
      className="flex space-x-3 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <UserAvatar user={comment.author} size="sm" />
      <div className="flex-1">
        <motion.div
          className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-lg"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-slate-100">{comment.author.name}</span>
            <TimeDisplay timestamp={comment.createdAt} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-300">{comment.content}</p>
        </motion.div>
        <div className="flex items-center mt-1 space-x-4 text-xs">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
              liked && "text-pink-500 hover:text-pink-400",
            )}
            onClick={handleLike}
            disabled={likeCommentMutation.isPending || !currentUser}
          >
            <motion.div whileTap={{ scale: 1.3 }} transition={{ type: "spring", stiffness: 500 }}>
              <Heart className={cn("h-4 w-4 mr-1", liked ? "fill-pink-500 text-pink-500" : "")} />
            </motion.div>
            <span>{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Reply className="h-4 w-4 mr-1" />
            <span>Reply</span>
          </Button>

          {isCurrentUserComment && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleDelete}
              disabled={deleteCommentMutation.isPending}
            >
              <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                <Trash2 className="h-4 w-4 mr-1" />
              </motion.div>
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Comment