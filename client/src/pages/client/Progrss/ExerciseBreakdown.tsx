"use client"
import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { WorkoutProgress } from "../WorkoutProgressChart"

interface ExerciseBreakdownProps {
  workouts: WorkoutProgress[]
  showAnimation: boolean
}

export default function ExerciseBreakdown({ workouts, showAnimation }: ExerciseBreakdownProps) {
  // Get unique exercise names
  const exerciseNames = Array.from(
    new Set(
      workouts.flatMap((workout) => workout.exerciseProgress.map((ex) => ex.exerciseDetails?.name).filter(Boolean)),
    ),
  )

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
        <CardHeader className="pb-2 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100/30">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardTitle className="text-xl flex items-center">
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3,
                }}
                whileHover={{
                  rotate: 10,
                  scale: 1.1,
                  transition: { duration: 0.2 },
                }}
              >
                <BarChart3 className="mr-2 h-5 w-5 text-violet-600" />
              </motion.div>
              Exercise Breakdown
            </CardTitle>
          </motion.div>
          <CardDescription>Exercise completion by type</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {exerciseNames.map((exerciseName, i) => {
              // Find all instances of this exercise across workouts
              const allExercises = workouts.flatMap((workout) =>
                workout.exerciseProgress.filter((ex) => ex.exerciseDetails?.name === exerciseName),
              )

              const completedCount = allExercises.filter((ex) => ex.status === "Completed").length
              const totalCount = allExercises.length
              const completionRate = (completedCount / totalCount) * 100

              return (
                <motion.div
                  key={exerciseName}
                  className="space-y-2 p-3 rounded-lg hover:bg-violet-50 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 * i + 0.5,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(139, 92, 246, 0.08)",
                    boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -1px rgba(124, 58, 237, 0.06)",
                  }}
                >
                  <div className="flex justify-between">
                    <motion.span
                      className="font-medium text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * i + 0.6 }}
                    >
                      {exerciseName}
                    </motion.span>
                    <motion.span
                      className="text-sm text-gray-500 font-medium"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * i + 0.6 }}
                    >
                      {completedCount}/{totalCount}
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #8b5cf6 0%, #4f46e5 100%)",
                          boxShadow: "0 0 8px rgba(139, 92, 246, 0.5)",
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: showAnimation ? `${completionRate}%` : 0,
                          transition: {
                            duration: 1.2,
                            delay: 0.1 * i + 0.8,
                            ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                          },
                        }}
                      />
                    </div>
                    <motion.span
                      className="text-xs font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * i + 1.5 }}
                      style={{
                        background: "linear-gradient(to right, #8b5cf6, #4f46e5)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {Math.round(completionRate)}%
                    </motion.span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
