"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Exercise } from "@/types/Workouts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Trash, Maximize2, Pause, Play, Timer, Dumbbell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import AddExerciseForm from "./AddExerciseForm"

interface ExerciseCardProps {
  exercise: Exercise
  workoutId: string
  onDelete?: () => void
  onEdit?: () => void
}

const ExerciseCard = ({ exercise, workoutId, onDelete, onEdit }: ExerciseCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = () => {
        setVideoLoaded(true)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  useEffect(() => {
    if (!isHovered && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isHovered])

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    if (onEdit) onEdit()
  }

  // Animation variants for background elements
  const bubbleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: 1,
      opacity: 0.07,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    }),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card
        className="h-full flex flex-col relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={bubbleVariants}
              initial="initial"
              animate="animate"
              className="absolute rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-700 dark:to-indigo-800"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: "blur(20px)",
              }}
            />
          ))}
          <div className="absolute inset-0 backdrop-blur-[100px] bg-white/70 dark:bg-gray-900/70" />
        </div>

        {/* Card content with glass effect */}
        <div className="relative z-10 flex flex-col h-full rounded-xl overflow-hidden backdrop-blur-sm">
          {exercise.videoUrl && (
            <div className="relative w-full aspect-video overflow-hidden">
              <video
                ref={videoRef}
                src={exercise.videoUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setVideoLoaded(true)}
              />

              {/* Video overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              {/* Video controls */}
              <AnimatePresence>
                {(isHovered || !videoLoaded) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlayPause}
                      className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 shadow-lg"
                    >
                      {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Duration indicator */}
              <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center shadow-md">
                <Clock className="h-3 w-3 mr-1.5" />
                <span>{exercise.duration}s</span>
              </div>

              {/* Fullscreen button */}
              <motion.a
                whileHover={{ scale: 1.1 }}
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-md p-1.5 rounded-full shadow-md border border-white/10"
              >
                <Maximize2 className="h-4 w-4 text-white" />
              </motion.a>
            </div>
          )}

          {/* Content section */}
          <div className={`flex-1 p-4 relative z-10 ${!exercise.videoUrl ? "pt-5" : ""}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{exercise.name}</h3>
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1 rounded-full text-xs text-white flex items-center shadow-sm">
                <Dumbbell className="h-3 w-3 mr-1.5" />
                <span>Exercise</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 mb-3 line-clamp-2">{exercise.description}</p>

            {/* Stats - horizontal layout with improved styling */}
            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{exercise.duration}s</span>
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
                <Timer className="h-3.5 w-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Rest: {exercise.defaultRestDuration}s
                </span>
              </div>
            </div>

            {/* Action buttons - improved styling */}
            <div className="flex gap-3">
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-all duration-200 hover:shadow font-medium"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-0">
                  <AddExerciseForm
                    workoutId={workoutId}
                    exerciseId={exercise._id}
                    initialData={exercise}
                    onSuccess={handleEditSuccess}
                  />
                </DialogContent>
              </Dialog>

              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-9 text-red-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all duration-200 hover:shadow font-medium"
                    >
                      <Trash className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border border-gray-200 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{exercise.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border border-gray-200 dark:border-gray-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default ExerciseCard
