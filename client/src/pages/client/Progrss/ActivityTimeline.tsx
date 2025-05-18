"use client"

import { format } from "date-fns"
import { Calendar, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import type { WorkoutProgress } from "../WorkoutProgressChart"
import StatusBadge from "./StatusBadge"

interface ActivityTimelineProps {
  workouts: WorkoutProgress[]
  showAnimation: boolean
}

export default function ActivityTimeline({ workouts, showAnimation }: ActivityTimelineProps) {
  // Calculate total workout completion percentage
  const calculateWorkoutCompletion = (workout: WorkoutProgress) => {
    const totalExercises = workout.exerciseProgress.length
    if (totalExercises === 0) return 0

    const completedExercises = workout.exerciseProgress.filter((ex) => ex.status === "Completed").length
    return Math.round((completedExercises / totalExercises) * 100)
  }

  // Get a color based on completion status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500"
      case "In Progress":
        return "bg-amber-500"
      default:
        return "bg-slate-300"
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const timelineItem = {
    hidden: { opacity: 0, x: -50 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <CardHeader className="bg-white border-b border-violet-100/30">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CardTitle className="text-xl flex items-center">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <Calendar className="mr-2 h-5 w-5 text-violet-600" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Recent Activity Timeline
            </motion.span>
          </CardTitle>
        </motion.div>
        <CardDescription>Your workout history and progress</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative p-6">
          <motion.div
            className="absolute left-4 top-0 bottom-0 w-0.5"
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(to bottom, #8b5cf6, #4f46e5, #6366f1)",
            }}
          />

          <motion.div
            className="space-y-8 relative pl-10"
            variants={container}
            initial="hidden"
            animate={showAnimation ? "show" : "hidden"}
          >
            {workouts.map((workout, workoutIndex) => (
              <motion.div
                key={workout._id}
                className="relative"
                variants={timelineItem}
                whileHover={{
                  x: 5,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="absolute -left-6 mt-1.5 h-4 w-4 rounded-full border-2 border-violet-300 bg-white shadow-md z-10"
                  initial={{ scale: 0, backgroundColor: "#ffffff" }}
                  animate={{
                    scale: 1,
                    backgroundColor: workoutIndex % 2 === 0 ? "#8b5cf6" : "#4f46e5",
                  }}
                  transition={{
                    duration: 0.4,
                    delay: workoutIndex * 0.2 + 0.5,
                    type: "spring",
                    stiffness: 300,
                  }}
                  whileHover={{
                    scale: 1.5,
                    backgroundColor: "#6366f1",
                    transition: { duration: 0.2 },
                  }}
                />

                <motion.div
                  className="mb-2 text-sm font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: workoutIndex * 0.2 + 0.6 }}
                  style={{
                    background: "linear-gradient(to right, #8b5cf6, #4f46e5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {format(new Date(workout.createdAt), "MMMM d, yyyy")}
                </motion.div>

                <motion.div
                  className="rounded-lg border border-violet-100 p-4 shadow-sm hover:shadow-md transition-all duration-300 bg-white"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium flex items-center">
                      <motion.div
                        initial={{ rotate: -30, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: workoutIndex * 0.2 + 0.7,
                          type: "spring",
                        }}
                      >
                        <Award className="h-4 w-4 mr-1 text-violet-500" />
                      </motion.div>
                      Workout {workoutIndex + 1}
                    </div>
                    <StatusBadge variant={calculateWorkoutCompletion(workout) === 100 ? "success" : "secondary"}>
                      {calculateWorkoutCompletion(workout)}% Complete
                    </StatusBadge>
                  </div>

                  <AnimatePresence>
                    <motion.div
                      className="space-y-3 mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: workoutIndex * 0.2 + 0.8 }}
                    >
                      {workout.exerciseProgress.map((exercise, exIndex) => (
                        <motion.div
                          key={exercise._id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-white transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: workoutIndex * 0.2 + 0.7 + exIndex * 0.05,
                            type: "spring",
                            stiffness: 100,
                          }}
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(139, 92, 246, 0.08)",
                          }}
                        >
                          <motion.div
                            className={`h-2 w-2 rounded-full ${getStatusColor(exercise.status)}`}
                            whileHover={{ scale: 1.5 }}
                            transition={{ duration: 0.2 }}
                          />
                          <div className="flex-1 text-sm">{exercise.exerciseDetails?.name || "Unknown Exercise"}</div>
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
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}