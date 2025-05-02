"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, AlertCircle } from "lucide-react"

interface EmptyStateAnimationProps {
  message: string
  subMessage?: string
}

export default function EmptyStateAnimation({ message, subMessage }: EmptyStateAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-12 text-center flex flex-col items-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, 0] }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
        className="relative mb-6"
      >
        <div className="relative">
          <Calendar className="h-16 w-16 text-gray-300" strokeWidth={1.5} />
          <motion.div
            animate={{
              rotate: [0, 360],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <Clock className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
          </motion.div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="absolute -top-2 -right-2"
          >
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        className="text-gray-600 text-lg font-medium mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {message}
      </motion.p>

      {subMessage && (
        <motion.p
          className="text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {subMessage}
        </motion.p>
      )}
    </motion.div>
  )
}
