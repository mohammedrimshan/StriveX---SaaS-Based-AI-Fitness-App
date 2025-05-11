"use client"

import { useState } from "react"
import type { Comment as CommentType, User } from "./index"
import Comment from "./Comment"
import { Button } from "../ui/button"
import UserAvatar from "./UserAvatar"
import { Textarea } from "../ui/textarea"
import { MessageCircle } from "lucide-react"
import { useCreateComment } from "@/hooks/community/useCommunity"
import { motion, AnimatePresence } from "framer-motion"

interface CommentSectionProps {
  comments?: CommentType[]
  postId: string
  commentCount: number
  onAddComment: (postId: string, content: string) => void
  currentUser: User | null
}

const CommentSection = ({ comments = [], postId, commentCount, onAddComment, currentUser }: CommentSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createCommentMutation = useCreateComment()

  const handleSubmit = () => {
    if (!newComment.trim() || !currentUser) return

    setIsSubmitting(true)
    createCommentMutation.mutate(
      { postId, textContent: newComment.trim(), media: undefined },
      {
        onSuccess: () => {
          onAddComment(postId, newComment.trim())
          setNewComment("")
          setIsSubmitting(false)
        },
        onError: () => {
          setIsSubmitting(false)
        },
      },
    )
  }

  if (comments.length === 0 && !isExpanded) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-slate-200 px-0 hover:bg-slate-800/50"
          onClick={() => setIsExpanded(true)}
          disabled={!currentUser}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Add comment
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="mt-4">
      {!isExpanded && comments.length > 0 && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-slate-200 px-0 hover:bg-slate-800/50"
            onClick={() => setIsExpanded(true)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {commentCount > 1 ? `View all ${commentCount} comments` : "View comment"}
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {comments.length > 0 && (
              <div className="border-t border-slate-700/50 pt-3 mt-2">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onLike={() => {}}
                    onDelete={undefined}
                    isCurrentUserComment={!!currentUser && comment.author.id === currentUser.id}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}

            <div className="flex items-start space-x-3 mt-4">
              {currentUser ? (
                <>
                  <UserAvatar user={currentUser} size="sm" />
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      className="resize-none min-h-[80px] bg-slate-800/90 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-violet-500"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                      {comments.length > 0 && (
                        <Button
                          variant="ghost"
                          className="mr-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                          onClick={() => setIsExpanded(false)}
                        >
                          Hide comments
                        </Button>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleSubmit}
                          disabled={!newComment.trim() || isSubmitting}
                          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
                        >
                          {isSubmitting ? "Posting..." : "Post"}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Please log in to add a comment.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CommentSection