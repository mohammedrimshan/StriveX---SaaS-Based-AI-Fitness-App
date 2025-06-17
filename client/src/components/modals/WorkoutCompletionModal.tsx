"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Flame, Clock, Target, CheckCircle, Calendar, TrendingUp, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

interface Exercise {
  name: string
  duration: string
}

interface WorkoutCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  workoutTitle: string
  workoutCategory: string
  difficulty: string
  exercisesCompleted: number
  totalExercises: number
  totalDuration: string
  caloriesBurned: number
  exercises: Exercise[]
  completedAt: string
}

const confettiVariants = {
  initial: { scale: 0, rotate: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [0, 180, 360],
    opacity: [0, 1, 0.8],
    transition: { duration: 0.8, ease: "easeOut" },
  },
}

const modalVariants = {
  initial: { scale: 0.8, opacity: 0, y: 50 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 50,
    transition: { duration: 0.2 },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export default function WorkoutCompletionModal({
  isOpen,
  onClose,
  userName,
  workoutTitle,
  workoutCategory,
  difficulty,
  exercisesCompleted,
  totalExercises,
  totalDuration,
  caloriesBurned,
  exercises,
  completedAt,
}: WorkoutCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(true)

const navigate = useNavigate()

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "text-emerald-600 bg-emerald-50"
      case "intermediate":
        return "text-amber-600 bg-amber-50"
      case "advanced":
        return "text-red-600 bg-red-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-0 shadow-2xl">
              <CardContent className="p-6 space-y-6">
                {/* Close Button */}
                <motion.button
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Celebration Header */}
                <motion.div className="text-center relative" variants={itemVariants}>
                  {/* Confetti Animation */}
                  <AnimatePresence>
                    {showConfetti && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{
                              left: `${20 + i * 10}%`,
                              top: `${10 + (i % 3) * 20}%`,
                            }}
                            variants={confettiVariants}
                            initial="initial"
                            animate="animate"
                            onAnimationComplete={() => {
                              if (i === 7) setShowConfetti(false)
                            }}
                          >
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <Trophy className="w-8 h-8 text-white" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Great job, {userName}!</h2>
                  <p className="text-gray-600">
                    You completed <span className="font-semibold text-blue-600">{workoutTitle}</span>!
                  </p>
                </motion.div>

                {/* Workout Summary */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Workout Summary</h3>
                  <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Title & Category</span>
                      <span className="font-medium text-gray-900">
                        {workoutTitle} ({workoutCategory})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Difficulty Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Exercises Completed
                      </span>
                      <span className="font-medium text-green-600">
                        {exercisesCompleted}/{totalExercises} exercises
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Total Duration
                      </span>
                      <span className="font-medium text-gray-900">{totalDuration}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Calories Burned
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-orange-600">{caloriesBurned} kcal</span>
                        {caloriesBurned > 1000 && <p className="text-xs text-gray-500">*Estimate based on activity</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Exercise Breakdown */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise Breakdown</h3>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {exercises.map((exercise, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between py-1"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{exercise.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{exercise.duration}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Progress Metrics */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Metrics</h3>
                  <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Completed on {formatDate(completedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Your progress has been saved!</span>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div className="space-y-3 pt-2" variants={itemVariants}>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-xl shadow-lg"
                    onClick={() => {
                      navigate(`/progress`);
                    }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 rounded-xl"
                    onClick={() => {
                   navigate(`/workouts`);
                    }}
                  >
                    Explore More Workouts
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
