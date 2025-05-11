"use client"

import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import type { Post, Comment as CommentType, User } from "./index"
import { useState } from "react"
import { Button } from "../ui/button"
import UserAvatar from "./UserAvatar"
import TimeDisplay from "./TimeDisplay"
import CategoryBadge from "./CategoryBadge"
import MediaDisplay from "./MediaDisplay"
import CommentSection from "./CommentSection"
import { Card } from "../ui/card"
import { cn } from "@/lib/utils"
import { useLikePost, useDeletePost, useReportPost } from "@/hooks/community/useCommunity"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface PostCardProps {
  post: Post
  currentUser: User | null
}

const PostCard = ({ post, currentUser }: PostCardProps) => { 
    console.log(post,"POST")   
  // Initialize comments state with an empty array if post.comments is null or undefined
  const [liked, setLiked] = useState(post.hasLiked)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [comments, setComments] = useState<CommentType[]>(post.comments || [])
  const [commentCount, setCommentCount] = useState(post.commentCount || 0)

  // Fix the isCurrentUserPost check by comparing the authorId from the post with the current user's id
  const isCurrentUserPost = !!(currentUser && post.authorId === currentUser.id)
console.log(isCurrentUserPost)
  const likePostMutation = useLikePost()
  const deletePostMutation = useDeletePost()
  const reportPostMutation = useReportPost()

  const handleLike = () => {
    const newLikedState = !liked
    setLiked(newLikedState)
    setLikeCount((prev:any) => (newLikedState ? prev + 1 : prev - 1))
    likePostMutation.mutate(post.id, {
      onError: () => {
        setLiked(liked)
        setLikeCount(likeCount)
      },
    })
  }

  const handleDelete = () => {
    if (isCurrentUserPost) {
      deletePostMutation.mutate(post.id)
    }
  }

  const handleReport = () => {
    if (!isCurrentUserPost) {
      reportPostMutation.mutate({ postId: post.id, reason: "Inappropriate content" })
    }
  }

  const handleAddComment = (postId: string, content: string) => {
    // Ensure we're working with an array
    setComments((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      {
        id: `temp-${Date.now()}`,
        content,
        author: currentUser!,
        createdAt: new Date().toISOString(),
        likes: 0,
        hasLiked: false,
      },
    ])
    setCommentCount((prev) => prev + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:shadow-violet-900/20">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <UserAvatar user={post.author} />
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold text-slate-100">{post.author?.name ?? "Unknown User"}</h3>
                  {post.author?.isTrainer && (
                    <motion.span
                      className="ml-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white text-xs px-2 py-0.5 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      Trainer
                    </motion.span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <TimeDisplay timestamp={post.createdAt} />
                  <span>•</span>
                  <CategoryBadge category={post.category} isTrainer={post.author?.isTrainer ?? false} />
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] bg-slate-800 border-slate-700 text-slate-200">
                {isCurrentUserPost ? (
                  <>
                    <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700">Edit post</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20"
                      onClick={handleDelete}
                    >
                      Delete post
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700">Save post</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20"
                      onClick={handleReport}
                    >
                      Report post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3">
            <p className="text-slate-300 whitespace-pre-line">{post.content || post.textContent}</p>
            <MediaDisplay imageUrl={post.imageUrl} videoUrl={post.videoUrl} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "gap-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
                  liked && "text-pink-500 hover:text-pink-400",
                )}
                disabled={likePostMutation.isPending}
              >
                <motion.div animate={liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                  <Heart className={cn("h-5 w-5", liked && "fill-pink-500")} />
                </motion.div>
                <span>{likeCount}</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{commentCount}</span>
              </Button>
            </motion.div>
          </div>

          <CommentSection
            comments={comments}
            postId={post.id}
            commentCount={commentCount}
            onAddComment={handleAddComment}
            currentUser={currentUser}
          />
        </div>
      </Card>
    </motion.div>
  )
}

export default PostCard