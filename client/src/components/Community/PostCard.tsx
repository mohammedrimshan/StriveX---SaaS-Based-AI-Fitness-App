"use client"

import React, { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Copy, Facebook, Twitter, Link, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { selectCurrentUser } from "@/store/userSelectors"
import { useLikePost } from "@/hooks/community/useLikePost"
import { useDeletePost } from "@/hooks/community/useDeletePost"
import { useReportPost } from "@/hooks/community/useReportPost"
import { useGetComments } from "@/hooks/community/useGetComments" // Import the useGetComments hook
import { useSocket } from "@/context/socketContext";
// Updated interface to match the actual data structure
interface Author {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  profileImage?: string
  isTrainer?: boolean
}

interface IPost {
  id: string
  authorId: string
  author?: Author
  textContent: string
  content: string
  category: string
  createdAt: string
  likes: string[]
  commentCount: number // This will be ignored in favor of useGetComments
  imageUrl?: string
  videoUrl?: string
  mediaUrl?: string
  role?: string
  isDeleted?: boolean
  hasLiked?: boolean
}

interface PostCardProps {
  post: IPost
  onComment: (postId: string) => void
}

const PostCard: React.FC<PostCardProps> = ({ post, onComment }) => {
  console.log(post, "pc")
  const currentUser = useSelector(selectCurrentUser)
    const { socket, isConnected } = useSocket();
  const [isSaved, setIsSaved] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [likeScale, setLikeScale] = useState(1)
  const { likePost, isLiking } = useLikePost()
  const { deletePost, isDeleting } = useDeletePost()
  const { reportPost, isReporting } = useReportPost()
  
  // Use the useGetComments hook to fetch comment data
  const { total: commentCount, isLoading: isCommentsLoading, error: commentsError } = useGetComments(post.id, 1, 10)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  const getInitials = (name?: string) => {
    if (!name) return "U"

    const nameParts = name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }

    return name[0].toUpperCase()
  }

  const formatTimeAgo = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

const handleLike = (e: React.MouseEvent) => {
  e.stopPropagation();

  if (!currentUser?.role || !currentUser?.id) {
    toast.error("Please log in to like posts");
    return;
  }

  if (socket && isConnected) {
    // ✅ join post room and wait for confirmation
    socket.emit("joinPost", post.id, () => {
      console.log(`[DEBUG] Confirmed join for room: post:${post.id}`);
      likePost({ id: post.id, role: currentUser.role, userId: currentUser.id });
    });
  } else {
    likePost({ id: post.id, role: currentUser.role, userId: currentUser.id });
  }

  setLikeScale(1.5);
  setTimeout(() => setLikeScale(1), 300);
};


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDropdown(false)
    if (currentUser?.role) {
      deletePost(
        { id: post.id, role: currentUser.role },
        {
          onSuccess: () => toast.success("Post deleted successfully"),
          onError: (err) => toast.error(err.message || "Failed to delete post"),
        }
      )
    }
  }

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDropdown(false)
    if (currentUser?.role) {
      reportPost(
        {
          id: post.id,
          reason: "Inappropriate content",
          role: currentUser.role,
        },
        {
          onSuccess: () => toast.success("Post reported successfully"),
          onError: (err) => toast.error(err.message || "Failed to report post"),
        }
      )
    }
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDropdown(!showDropdown)
    if (showShareMenu) setShowShareMenu(false)
  }

  const toggleShareMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowShareMenu(!showShareMenu)
    if (showDropdown) setShowDropdown(false)
  }

  const closeDropdown = (e: React.MouseEvent) => {
    if (showDropdown) {
      e.stopPropagation()
      setShowDropdown(false)
    }
  }

  const handleShare = (platform: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const postUrl = `${window.location.origin}/posts/${post.id}`
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(postUrl)
          .then(() => toast.success("Link copied to clipboard"))
          .catch(() => toast.error("Failed to copy link"))
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank')
        break
      case 'twitter':
        const text = `Check out this post: ${(post.textContent || post.content).substring(0, 100)}...`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`, '_blank')
        break
      case 'direct':
        if (navigator.share) {
          navigator.share({
            title: 'Check out this post',
            text: post.textContent || post.content,
            url: postUrl
          })
          .catch((error) => console.log('Error sharing', error))
        } else {
          toast.error("Native sharing not supported on this browser")
        }
        break
      default:
        break
    }
    
    setShowShareMenu(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const isAuthor = post.authorId === currentUser?.id
  const hasLiked = post.hasLiked || post.likes.includes(currentUser?.id || "")
  const isTrainer = post.author?.isTrainer || post.role === "trainer"

  const postImage = post.mediaUrl || post.imageUrl

  const authorName =
    post.author?.name ||
    (post.author?.firstName && post.author?.lastName
      ? `${post.author.firstName} ${post.author.lastName}`.trim()
      : "Anonymous")

  // Handle comments error (optional)
  useEffect(() => {
    if (commentsError) {
      console.error("Error fetching comments:", commentsError)
      // Optionally show a toast or fallback to post.commentCount
      // toast.error("Failed to load comments count")
    }
  }, [commentsError])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 overflow-hidden"
      onClick={() => onComment(post.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Post header */}
      <div className="flex justify-between items-center p-3">
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Avatar className="h-10 w-10 border border-gray-200 ring-2 ring-offset-2 ring-opacity-50 ring-blue-100">
            {post.author?.profileImage || post.author?.avatarUrl ? (
              <AvatarImage
                src={post.author.profileImage || post.author.avatarUrl}
                alt={authorName}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs font-medium">
                {post.author ? getInitials(post.author.name) : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold text-sm">{authorName}</h3>
              {isTrainer && (
                <motion.svg
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-4 h-4 ml-1 text-[#0095F6] fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </motion.svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{post.category}</p>
          </div>
        </motion.div>
        
        {/* Fixed dropdown menu */}
        <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
            onClick={toggleDropdown}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-700" />
          </motion.button>
          
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-10 w-48 rounded-xl shadow-lg bg-white border border-gray-100 py-1 z-50"
              >
                <div 
                  className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleReport}
                >
                  Report
                </div>
                {isAuthor && (
                  <>
                    <div 
                      className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={closeDropdown}
                    >
                      Edit Post
                    </div>
                    <div 
                      className="text-sm py-2 px-3 cursor-pointer text-red-500 hover:bg-red-50 transition-colors"
                      onClick={handleDelete}
                    >
                      Delete Post
                    </div>
                  </>
                )}
                <div 
                  className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleShare('copy')}
                >
                  Copy Link
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post image with hover effect */}
      {postImage && (
        <div className="relative aspect-square bg-black overflow-hidden">
          <motion.img
            src={postImage || "/placeholder.svg"}
            alt={(post.textContent || post.content).substring(0, 20)}
            className="w-full h-full object-contain"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            animate={{ 
              filter: isHovered ? "brightness(1.1)" : "brightness(1)" 
            }}
          />
        </div>
      )}

      {/* Post actions */}
      <div className="p-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              animate={{ scale: likeScale }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={handleLike}
              className="text-black focus:outline-none"
              disabled={isLiking}
              aria-label={hasLiked ? "Unlike" : "Like"}
            >
              <Heart
                className={`h-6 w-6 ${hasLiked ? "fill-red-500 text-red-500" : "fill-none"} transition-colors duration-300`}
                strokeWidth={hasLiked ? 0 : 2}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onComment(post.id)
              }}
              className="text-black focus:outline-none"
              aria-label="Comment"
            >
              <MessageCircle className="h-6 w-6 fill-none" />
            </motion.button>

            {/* Share button with dropdown */}
            <div className="relative" ref={shareMenuRef}>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleShareMenu} 
                className="text-black focus:outline-none" 
                aria-label="Share"
              >
                <Send className="h-6 w-6 fill-none" />
              </motion.button>
              
              {/* Share options menu */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 bottom-10 w-48 rounded-xl shadow-lg bg-white border border-gray-100 py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div 
                      className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2"
                      onClick={handleShare('copy')}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </div>
                    <div 
                      className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2"
                      onClick={handleShare('facebook')}
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Share to Facebook
                    </div>
                    <div 
                      className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2"
                      onClick={handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4 text-blue-400" />
                      Share to Twitter
                    </div>
                    {typeof navigator.share === "function" && (
                      <div 
                        className="text-sm py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2"
                        onClick={handleShare('direct')}
                      >
                        <Share2 className="h-4 w-4" />
                        Share...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setIsSaved(!isSaved)
            }}
            className="text-black focus:outline-none"
            aria-label={isSaved ? "Unsave" : "Save"}
          >
            <Bookmark 
              className={`h-6 w-6 ${isSaved ? "fill-black" : "fill-none"} transition-all duration-300`} 
            />
          </motion.button>
        </div>

        {/* Likes count with animated number */}
        {post.likes.length > 0 && (
          <motion.div 
            className="mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm font-semibold">
              {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
            </p>
          </motion.div>
        )}

        {/* Caption */}
        <motion.div 
          className="mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm">
            <span className="font-semibold">{authorName}</span>{" "}
            {post.textContent || post.content}
          </p>
        </motion.div>

        {/* Comments preview with highlight effect */}
        {commentCount > 0 && (
          <motion.button
            whileHover={{ color: "#3B82F6" }}
            className="text-sm text-gray-500 mt-2"
            onClick={(e) => {
              e.stopPropagation()
              onComment(post.id)
            }}
            disabled={isCommentsLoading}
          >
            {isCommentsLoading ? "Loading comments..." : `View all ${commentCount} comments`}
          </motion.button>
        )}

        {/* Timestamp */}
        <p className="text-xs uppercase text-gray-400 mt-2">{formatTimeAgo(post.createdAt)}</p>
      </div>
    </motion.div>
  )
}

export default PostCard