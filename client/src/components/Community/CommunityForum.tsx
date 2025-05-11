"use client"

import { useEffect } from "react"
import Header from "./Header"
import PostFeed from "./PostFeed"
import CreatePostModal from "./CreatePostModal"
import { useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/context/socketContext"
import { motion } from "framer-motion"

const CommunityForum = () => {
  const queryClient = useQueryClient()
  const { isConnected } = useSocket()

  const handlePostCreated = (content: string, imageFile?: File) => {
    console.log("New post created:", { content, imageFile })
    // Invalidate posts query to refresh the feed
    queryClient.invalidateQueries({ queryKey: ["posts"] })
  }

  // Monitor socket connection and invalidate posts on reconnection
  useEffect(() => {
    if (isConnected) {
      console.log("Socket reconnected - refreshing posts")
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    }
  }, [isConnected, queryClient])

  return (
    <motion.div
      className="min-h-screen mt-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header onPostCreated={handlePostCreated} />

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <motion.h2
            className="text-xl font-semibold text-slate-100 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Latest Posts
          </motion.h2>
          <motion.div
            className="block sm:hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CreatePostModal onPostCreated={handlePostCreated} />
          </motion.div>
        </div>

        <PostFeed />
      </div>
    </motion.div>
  )
}

export default CommunityForum