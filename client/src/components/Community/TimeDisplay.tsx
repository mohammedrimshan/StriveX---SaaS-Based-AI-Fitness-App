"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface TimeDisplayProps {
  timestamp: string
  className?: string
}

const TimeDisplay = ({ timestamp, className = "" }: TimeDisplayProps) => {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const calculateTimeAgo = () => {
      const date = new Date(timestamp)
      const now = new Date()

      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) {
        setTimeAgo("just now")
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        setTimeAgo(`${minutes}m ago`)
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        setTimeAgo(`${hours}h ago`)
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        setTimeAgo(`${days}d ago`)
      } else {
        setTimeAgo(date.toLocaleDateString())
      }
    }

    calculateTimeAgo()
    const timer = setInterval(calculateTimeAgo, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [timestamp])

  return (
    <motion.span
      className={`text-sm ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {timeAgo}
    </motion.span>
  )
}

export default TimeDisplay
