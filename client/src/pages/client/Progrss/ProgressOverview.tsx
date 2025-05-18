"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Clock, CheckCircle2, ChevronUp, ChevronDown, Play, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import type { WorkoutProgress } from "../WorkoutProgressChart"
import StatusBadge from "./StatusBadge"

interface WorkoutListProps {
  workouts: WorkoutProgress[]
  showAnimation: boolean
}

export default function WorkoutList({ workouts, showAnimation }: WorkoutListProps) {
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({})

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }))
  }

  // Calculate total workout completion percentage
  const calculateWorkoutCompletion = (workout: WorkoutProgress) => {
    const totalExercises = workout.exerciseProgress.length
    if (totalExercises === 0) return 0

    const completedExercises = workout.exerciseProgress.filter((ex) => ex.status === "Completed").length
    return Math.round((completedExercises / totalExercises) * 100)
  }

  // Calculate total duration of a workout
  const calculateTotalDuration = (workout: WorkoutProgress) => {
    return workout.exerciseProgress.reduce((total, ex) => total + (ex.exerciseDetails?.duration || 0), 0)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const listItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate={showAnimation ? "show" : "hidden"}>
      {workouts.map((workout, index) => {
        const isExpanded = expandedWorkouts[workout._id] || false
        const completionPercentage = calculateWorkoutCompletion(workout)
        const totalDuration = calculateTotalDuration(workout)

        return (
          <motion.div key={workout._id} variants={listItem} layout>
            <Card
              className={`overflow-hidden border-0 shadow-lg bg-white rounded-xl transition-all duration-500 ${
                isExpanded ? "shadow-xl" : "hover:shadow-xl transform hover:-translate-y-1"
              }`}
            >
              <CardHeader className="pb-2 bg-white border-b border-violet-100/30">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <motion.div
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1 * index + 0.3,
                      }}
                      whileHover={{
                        rotate: 10,
                        scale: 1.1,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Zap className="h-5 w-5 mr-2 text-violet-600" />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index + 0.4 }}
                    >
                      Workout {index + 1}
                    </motion.span>
                  </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, rotate: 180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index + 0.5 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-8 w-8 p-0 hover:bg-white hover:text-violet-600 transition-colors duration-200"
                      onClick={() => toggleWorkout(workout._id)}
                      aria-label={isExpanded ? "Collapse workout details" : "Expand workout details"}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </motion.div>
                </div>
                <CardDescription>
                  {format(new Date(workout.createdAt), "MMMM d, yyyy")} • {workout.exerciseProgress.length} exercises
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <motion.div
                  className="flex items-center justify-between mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index + 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                      <Clock className="h-4 w-4 text-violet-500" />
                    </motion.div>
                    <span className="text-sm text-gray-600">
                      {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.3 }}>
                      <CheckCircle2 className="h-4 w-4 text-violet-500" />
                    </motion.div>
                    <span className="text-sm text-gray-600">
                      {workout.exerciseProgress.filter((ex) => ex.status === "Completed").length}/
                      {workout.exerciseProgress.length} completed
                    </span>
                  </div>
                </motion.div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #8b5cf6 0%, #4f46e5 100%)",
                      boxShadow: "0 0 8px rgba(139, 92, 246, 0.5)",
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: showAnimation ? `${completionPercentage}%` : 0,
                      transition: {
                        duration: 1.2,
                        delay: 0.1 * index + 0.7,
                        ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                      },
                    }}
                  />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="mt-6 space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                    >
                      {workout.exerciseProgress.map((exercise, exIndex) => (
                        <motion.div
                          key={exercise._id}
                          className="p-4 rounded-lg border border-violet-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: exIndex * 0.05,
                            type: "spring",
                            stiffness: 100,
                          }}
                          whileHover={{
                            scale: 1.02,
                            boxShadow:
                              "0 10px 15px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -2px rgba(124, 58, 237, 0.05)",
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <motion.h4
                                className="font-medium"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: exIndex * 0.05 + 0.1 }}
                              >
                                {exercise.exerciseDetails?.name || "Unknown Exercise"}
                              </motion.h4>
                              <motion.p
                                className="text-sm text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: exIndex * 0.05 + 0.2 }}
                              >
                                {exercise.exerciseDetails?.description || ""}
                              </motion.p>
                            </div>
                            <StatusBadge
                              variant={
                                exercise.status === "Completed"
                                  ? "success"
                                  : exercise.status === "In Progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {exercise.status}
                            </StatusBadge>
                          </div>

                          <motion.div
                            className="flex items-center gap-4 mt-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: exIndex * 0.05 + 0.3 }}
                          >
                            <div className="flex items-center gap-1.5">
                              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                                <Clock className="h-4 w-4 text-violet-500" />
                              </motion.div>
                              <span className="text-xs">
                                {Math.floor((exercise.exerciseDetails?.duration || 0) / 60)}:
                                {((exercise.exerciseDetails?.duration || 0) % 60).toString().padStart(2, "0")}
                              </span>
                            </div>

                            {exercise.status === "Completed" ? (
                              <div className="flex items-center gap-1.5">
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    duration: 0.5,
                                    delay: exIndex * 0.05 + 0.4,
                                    type: "spring",
                                    stiffness: 200,
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </motion.div>
                                <span className="text-xs">
                                  Completed on {format(new Date(exercise.lastUpdated), "MMM d, h:mm a")}
                                </span>
                              </div>
                            ) : exercise.status === "In Progress" ? (
                              <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{exercise.videoProgress}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full"
                                    style={{
                                      background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                                      boxShadow: "0 0 8px rgba(245, 158, 11, 0.5)",
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${exercise.videoProgress}%` }}
                                    transition={{
                                      duration: 0.8,
                                      delay: exIndex * 0.05 + 0.5,
                                      ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: exIndex * 0.05 + 0.4 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-colors duration-200"
                                >
                                  <Play className="h-3 w-3" /> Start Exercise
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              <CardFooter className={isExpanded ? "pt-2" : "pt-0"}>
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index + 0.8 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-violet-600 hover:bg-white hover:text-violet-700 transition-colors duration-200"
                    onClick={() => toggleWorkout(workout._id)}
                  >
                    {isExpanded ? "Show Less" : "Show Details"}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
