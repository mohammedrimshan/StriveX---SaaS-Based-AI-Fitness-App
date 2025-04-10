"use client"

import { motion } from "framer-motion"

export default function TrainersLoading() {
  // Create an array of placeholders
  const placeholders = Array(6).fill(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {placeholders.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
        >
          {/* Animated loading bar at the top */}
          <div className="h-2 bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                ease: "linear",
              }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            />
          </div>

          {/* Content placeholders */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="h-20 w-20 rounded-xl bg-gray-200 animate-pulse mr-4" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded-md animate-pulse mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/2" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>

              <div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/4 mb-2" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="h-10 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

