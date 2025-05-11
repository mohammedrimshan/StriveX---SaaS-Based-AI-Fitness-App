"use client"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Eye } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface MediaDisplayProps {
  imageUrl?: string
  videoUrl?: string
}

const MediaDisplay = ({ imageUrl, videoUrl }: MediaDisplayProps) => {
  const [expanded, setExpanded] = useState(false)

  if (!imageUrl && !videoUrl) return null

  if (videoUrl) {
    return (
      <motion.div
        className="mt-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AspectRatio ratio={16 / 9}>
          <video src={videoUrl} controls className="w-full h-full object-cover" poster={imageUrl} />
        </AspectRatio>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`mt-4 rounded-xl overflow-hidden border border-slate-700 ${expanded ? "" : "max-h-[350px]"} bg-slate-800/50 shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layoutId="media-container"
    >
      <AnimatePresence>
        <div className={`${expanded ? "" : "relative"}`}>
          <motion.img
            src={imageUrl}
            alt="Post attachment"
            className={`w-full ${expanded ? "" : "h-auto max-h-[350px] object-cover"}`}
            layoutId="media-image"
          />
          {!expanded && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary"
                  className="mb-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-600/50"
                  onClick={() => setExpanded(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View full image
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </motion.div>
  )
}

export default MediaDisplay
