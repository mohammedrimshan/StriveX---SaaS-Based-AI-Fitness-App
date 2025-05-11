"use client"

import { useEffect, useRef, useState } from "react"
import type { Post as PostType } from "./index"
import PostCard from "./PostCard"
import { Skeleton } from "../ui/skeleton"
import { usePosts } from "@/hooks/community/useCommunity"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/store/userSelectors"
import { useSocket } from "@/context/socketContext"
import { motion, AnimatePresence } from "framer-motion"

const PostFeed = () => {
  const currentUser = useSelector(selectCurrentUser)
  console.log(currentUser,"POSTFEED")
  const [skip, setSkip] = useState(0)
  const limit = 10

  // Use socket context unconditionally
  const { isConnected, socket } = useSocket()
  const isSocketConnected = isConnected
  const socketAvailable = !!socket

  const { data, isLoading, isFetching, error } = usePosts({
    skip,
    limit,
    enabled: socketAvailable ? isSocketConnected : true, // Allow fetching even if socket is not available
  })

  console.log(data,"USEE")

  const [posts, setPosts] = useState<PostType[]>([])
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Update posts when new data is fetched
  useEffect(() => {
    console.log("PostFeed useEffect - Data:", data)
    if (data?.posts && Array.isArray(data.posts)) {
      if (data.posts.length > 0) {
        setPosts((prev: any) => {
          const prevPosts = Array.isArray(prev) ? prev : []
          const newPosts = data.posts.filter((post) => !prevPosts.some((p) => p.id === post.id))
          console.log("New posts:", newPosts, "Previous posts:", prevPosts)
          return [...prevPosts, ...newPosts]
        })
      } else if (skip === 0) {
        console.log("No posts on first page, clearing posts")
        setPosts([])
      }
      setHasMore(data.posts.length === limit)
    }
  }, [data, limit, skip])

  // Infinite scrolling with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching && !isLoading) {
          setSkip((prev) => prev + limit)
        }
      },
      { threshold: 0.5 },
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [hasMore, isFetching, isLoading, limit])

  // Handle missing socket context gracefully
  if (!socketAvailable) {
    return (
      <motion.div
        className="p-4 rounded-md bg-orange-900/20 border border-orange-700/30 text-orange-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-center">
          Socket communication is not available. Please make sure you're properly logged in.
        </p>
      </motion.div>
    )
  }

  // Handle socket disconnected state
  if (socketAvailable && !isSocketConnected) {
    return (
      <motion.div
        className="p-4 rounded-md bg-yellow-900/20 border border-yellow-700/30 text-yellow-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-center">
          Connection to server is unavailable. Please check your internet connection and try again.
        </p>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="p-4 rounded-md bg-red-900/20 border border-red-700/30 text-red-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-center">Error loading posts: {error.message}</p>
      </motion.div>
    )
  }

  // Safety check for posts
  const displayPosts = Array.isArray(posts) ? posts : []

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {displayPosts.length > 0 ? (
          displayPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <PostCard post={post} currentUser={currentUser} />
            </motion.div>
          ))
        ) : !isLoading && !isFetching ? (
          <motion.p
            className="text-center text-slate-400 my-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            No posts available. Be the first to create a post!
          </motion.p>
        ) : null}
      </AnimatePresence>

      {(isLoading || isFetching) && (
        <div className="space-y-4">
          <Skeleton className="w-full h-[250px] rounded-xl bg-slate-800/50" />
          <div className="space-y-2">
            <Skeleton className="w-1/3 h-4 bg-slate-800/50" />
            <Skeleton className="w-1/4 h-4 bg-slate-800/50" />
          </div>
        </div>
      )}

      <div ref={loaderRef} className="h-4" />

      {!hasMore && !isLoading && !isFetching && displayPosts.length > 0 && (
        <motion.p
          className="text-center text-slate-400 my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          You've reached the end of the feed. Check back later for more posts!
        </motion.p>
      )}
    </div>
  )
}

export default PostFeed
