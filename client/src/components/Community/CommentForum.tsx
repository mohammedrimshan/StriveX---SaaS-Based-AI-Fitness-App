"use client"

import type React from "react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { selectCurrentUser } from "@/store/userSelectors"
import { toast } from "react-hot-toast"

interface CommentFormProps {
  postId: string
  onSubmit: (postId: string, comment: string) => void
   disabled?: boolean
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onSubmit }) => {
  const [comment, setComment] = useState("")
  const currentUser = useSelector(selectCurrentUser)

  const getInitials = () => {
    if (!currentUser?.name) return "U"
    const [firstName, lastName] = currentUser.name.split(" ")
    return `${firstName[0]}${lastName?.[0] || ""}`.toUpperCase()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      return
    }

    if (!currentUser) {
      toast.error("Please log in to comment")
      return
    }

    onSubmit(postId, comment.trim())
    setComment("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <Avatar className="h-8 w-8 border border-gray-200">
        {currentUser?.avatarUrl ? (
          <AvatarImage
            src={currentUser.avatarUrl || "/placeholder.svg"}
            alt={currentUser.name}
            className="object-cover"
          />
        ) : (
          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">{getInitials()}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 flex items-center">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm border-0 focus:ring-0 focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={!comment.trim() || !currentUser}
          className={`text-sm font-semibold ${comment.trim() && currentUser ? "text-[#0095F6]" : "text-[#0095F6]/40"}`}
        >
          Post
        </button>
      </div>
    </form>
  )
}

export default CommentForm
