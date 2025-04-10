"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FaDumbbell,
  FaUtensils,
  FaFire,
  FaWater,
  FaAppleAlt,
  FaHeartbeat,
  FaRunning,
  FaWeight,
  FaArrowRight,
  FaBolt,
  FaCalendarAlt,
  FaChevronRight,
} from "react-icons/fa"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { IWorkoutPlan } from "@/types/Workout"
import type { IDietPlan } from "@/types/Diet"

interface PlanDisplayProps {
  plan: IWorkoutPlan | IDietPlan | null
  type: "workout" | "diet"
}

export function PlanDisplay({ plan, type }: PlanDisplayProps) {
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!plan || !plan.weeklyPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#f3e8ff] to-[#fce7f3] rounded-xl shadow-sm"
      >
        <div className="relative w-40 h-40 mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[var(--violet)] to-[#ec4899] animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
              {type === "workout" ? (
                <FaDumbbell className="text-5xl text-[#7c3aed]" />
              ) : (
                <FaUtensils className="text-5xl text-[#db2777]" />
              )}
            </div>
          </div>
        </div>
        <p className="mt-6 text-xl font-medium text-gray-700">No plan available yet. Generate a plan to get started!</p>
        <Button className="mt-4 bg-gradient-to-r from-[var(--violet)] to-[#ec4899] hover:from-[#7c3aed] hover:to-[#db2777] text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
          Generate New Plan
        </Button>
      </motion.div>
    )
  }

  const isWorkout = type === "workout"
  const weeklyPlan = plan.weeklyPlan || []

  const handleDayClick = (day: any) => {
    setSelectedDay(day)
    setIsModalOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8 max-w-5xl mx-auto p-4"
    >
      {/* Header Card */}
      <Card
        className={`overflow-hidden border-0 shadow-2xl ${
          isWorkout
            ? "bg-gradient-to-r from-[#6d28d9] via-[#7e22ce] to-[#a21caf]"
            : "bg-gradient-to-r from-[#e11d48] via-[#db2777] to-[#f97316]"
        }`}
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 text-white md:w-2/3 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute w-40 h-40 rounded-full bg-white/30 -top-10 -left-10 animate-blob" />
                <div className="absolute w-40 h-40 rounded-full bg-white/30 top-40 left-40 animate-blob animation-delay-2000" />
                <div className="absolute w-40 h-40 rounded-full bg-white/30 bottom-10 right-10 animate-blob animation-delay-4000" />
              </div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative z-10"
              >
                <Badge className={`mb-4 ${isWorkout ? "bg-[#a78bfa]" : "bg-[#fb7185]"} text-white hover:bg-opacity-90`}>
                  {isWorkout ? "FITNESS PROGRAM" : "NUTRITION PLAN"}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                  {isWorkout ? (
                    <>
                      <FaDumbbell className="text-[#c4b5fd]" /> {plan.title || "Custom Workout Plan"}
                    </>
                  ) : (
                    <>
                      <FaUtensils className="text-[#fda4af]" /> {plan.title || "Custom Diet Plan"}
                    </>
                  )}
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  {plan.description || "Personalized plan designed to help you reach your fitness goals"}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1">
                    {weeklyPlan.length} Days
                  </Badge>
                  {isWorkout ? (
                    <>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1">
                        <FaHeartbeat className="mr-1" /> Cardio & Strength
                      </Badge>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1">
                        <FaRunning className="mr-1" /> Progressive Overload
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1">
                        <FaFire className="mr-1" /> Balanced Macros
                      </Badge>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1">
                        <FaAppleAlt className="mr-1" /> Nutrient Dense
                      </Badge>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/3 flex items-center justify-center p-6 bg-white/10 relative overflow-hidden">
              {/* Animated icon */}
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-full ${
                      isWorkout ? "bg-[#ddd6fe]/30" : "bg-[#fecdd3]/30"
                    } animate-ping-slow`}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-32 h-32 rounded-full ${
                      isWorkout ? "bg-[#c4b5fd]/40" : "bg-[#fda4af]/40"
                    } animate-ping-slow animation-delay-1000`}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    {isWorkout ? (
                      <FaDumbbell className="text-5xl text-[#7c3aed] animate-bounce-subtle" />
                    ) : (
                      <FaUtensils className="text-5xl text-[#e11d48] animate-bounce-subtle" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeklyPlan.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card
              className={`h-full border hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group ${
                isWorkout
                  ? "hover:border-[#a78bfa] hover:bg-[#f5f3ff]/50"
                  : "hover:border-[#fb7185] hover:bg-[#fff1f2]/50"
              }`}
              onClick={() => handleDayClick(day)}
            >
              <CardHeader
                className={`pb-2 relative overflow-hidden ${
                  isWorkout
                    ? "bg-gradient-to-r from-[#ede9fe] to-[#fae8ff]"
                    : "bg-gradient-to-r from-[#ffe4e6] to-[#ffedd5]"
                }`}
              >
                <div className="absolute inset-0 w-full h-full">
                  <div
                    className={`absolute -right-6 -top-6 w-16 h-16 rounded-full ${
                      isWorkout ? "bg-[#ddd6fe]" : "bg-[#fecdd3]"
                    } group-hover:scale-150 transition-transform duration-500`}
                  />
                </div>
                <CardTitle
                  className={`text-xl font-bold flex items-center gap-2 relative z-10 ${
                    isWorkout ? "text-[#6d28d9]" : "text-[#be123c]"
                  }`}
                >
                  <FaCalendarAlt className={isWorkout ? "text-[var(--violet)]" : "text-[#f43f5e]"} />
                  Day {day.day || index + 1}
                </CardTitle>
                {isWorkout && (day as any).focus && (
                  <CardDescription className="font-medium text-sm relative z-10">
                    Focus: {(day as any).focus}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-4 relative">
                {isWorkout ? (
                  <div className="space-y-3">
                    {(day as any).exercises?.slice(0, 3).map((exercise: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm group/item">
                        <div
                          className={`w-8 h-8 rounded-full bg-[#ede9fe] flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300 ${
                            isWorkout ? "group-hover/item:bg-[#ddd6fe]" : "group-hover/item:bg-[#fecdd3]"
                          }`}
                        >
                          <FaDumbbell
                            className={`${isWorkout ? "text-[var(--violet)]" : "text-[#f43f5e]"} group-hover/item:rotate-12 transition-transform duration-300`}
                          />
                        </div>
                        <div className="truncate font-medium">{exercise.name}</div>
                      </div>
                    ))}
                    {((day as any).exercises?.length || 0) > 3 && (
                      <div
                        className={`text-sm font-medium flex items-center mt-2 ${
                          isWorkout ? "text-[#7c3aed]" : "text-[#e11d48]"
                        }`}
                      >
                        +{((day as any).exercises?.length || 0) - 3} more exercises
                        <FaChevronRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(day as any).meals?.slice(0, 3).map((meal: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm group/item">
                        <div
                          className={`w-8 h-8 rounded-full bg-[#ffe4e6] flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300 ${
                            isWorkout ? "group-hover/item:bg-[#ddd6fe]" : "group-hover/item:bg-[#fecdd3]"
                          }`}
                        >
                          <FaAppleAlt
                            className={`${isWorkout ? "text-[var(--violet)]" : "text-[#f43f5e]"} group-hover/item:rotate-12 transition-transform duration-300`}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-xs text-gray-500">{meal.time}</div>
                        </div>
                      </div>
                    ))}
                    {((day as any).meals?.length || 0) > 3 && (
                      <div
                        className={`text-sm font-medium flex items-center mt-2 ${
                          isWorkout ? "text-[#7c3aed]" : "text-[#e11d48]"
                        }`}
                      >
                        +{((day as any).meals?.length || 0) - 3} more meals
                        <FaChevronRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </div>
                )}

                {/* Animated corner decoration */}
                <div
                  className={`absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    isWorkout ? "text-[#ddd6fe]" : "text-[#fecdd3]"
                  }`}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M0,100 L100,100 L100,0 Z" fill="currentColor" />
                  </svg>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button
                  variant="ghost"
                  className={`w-full justify-center group-hover:font-medium ${
                    isWorkout
                      ? "text-[#7c3aed] hover:text-[#6d28d9] hover:bg-[#ede9fe]/50"
                      : "text-[#e11d48] hover:text-[#be123c] hover:bg-[#ffe4e6]/50"
                  }`}
                >
                  View Details
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Day Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedDay && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-2xl font-bold ${isWorkout ? "text-[#6d28d9]" : "text-[#be123c]"}`}>
                  Day {selectedDay.day || "N/A"} {isWorkout && selectedDay.focus ? `- ${selectedDay.focus}` : ""}
                </DialogTitle>
                <DialogDescription>
                  {isWorkout
                    ? "Complete all exercises with proper form for best results"
                    : "Follow the meal plan closely for optimal nutrition"}
                </DialogDescription>
              </DialogHeader>

              <div
                className="overflow-y-auto pr-2"
                style={{
                  maxHeight: "calc(90vh - 200px)",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {isWorkout ? (
                  <div className="space-y-6 py-4">
                    {/* Workout Details */}
                    {selectedDay.warmup && (
                      <div className="bg-[#fffbeb] p-4 rounded-lg border border-[#fde68a] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-[#fef3c7]">
                            <path d="M0,0 L100,0 L100,100 Z" fill="currentColor" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-[#b45309] flex items-center gap-2 mb-2 relative z-10">
                          <FaRunning className="animate-bounce-subtle" /> Warm-up
                        </h4>
                        <p className="text-[#92400e] relative z-10">{selectedDay.warmup}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700 text-lg flex items-center">
                        <FaBolt className={`mr-2 ${isWorkout ? "text-[var(--violet)]" : "text-[#f43f5e]"}`} />
                        Exercises
                      </h4>
                      {selectedDay.exercises?.map((exercise: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
                            isWorkout ? "hover:border-[#c4b5fd]" : "hover:border-[#fda4af]"
                          }`}
                        >
                          {/* Background decoration */}
                          <div
                            className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${
                              isWorkout ? "bg-[#f5f3ff]" : "bg-[#fff1f2]"
                            } group-hover:scale-150 transition-transform duration-500 opacity-70`}
                          />

                          <div className="flex items-start gap-3 relative z-10">
                            <div
                              className={`w-12 h-12 rounded-lg ${
                                isWorkout ? "bg-[#ede9fe]" : "bg-[#ffe4e6]"
                              } flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                            >
                              <FaDumbbell
                                className={`text-xl ${
                                  isWorkout ? "text-[var(--violet)]" : "text-[#f43f5e]"
                                } group-hover:rotate-12 transition-transform duration-300`}
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-800">{exercise.name || "Unnamed Exercise"}</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                <Badge
                                  variant="outline"
                                  className={`justify-center ${
                                    isWorkout ? "border-[#ddd6fe] bg-[#f5f3ff]" : "border-[#fecdd3] bg-[#fff1f2]"
                                  }`}
                                >
                                  {exercise.sets || 0} sets
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`justify-center ${
                                    isWorkout ? "border-[#ddd6fe] bg-[#f5f3ff]" : "border-[#fecdd3] bg-[#fff1f2]"
                                  }`}
                                >
                                  {exercise.reps || "N/A"} reps
                                </Badge>
                                {exercise.duration && (
                                  <Badge
                                    variant="outline"
                                    className={`justify-center ${
                                      isWorkout ? "border-[#ddd6fe] bg-[#f5f3ff]" : "border-[#fecdd3] bg-[#fff1f2]"
                                    }`}
                                  >
                                    {exercise.duration}
                                  </Badge>
                                )}
                              </div>
                              {exercise.restTime && (
                                <p className="text-sm text-gray-500 mt-2">
                                  <span className="font-medium">Rest:</span> {exercise.restTime}
                                </p>
                              )}
                              {exercise.notes && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {selectedDay.cooldown && (
                      <div
                        className={`p-4 rounded-lg border relative overflow-hidden ${
                          isWorkout ? "bg-[#f5f3ff] border-[#ddd6fe]" : "bg-[#fff1f2] border-[#fecdd3]"
                        }`}
                      >
                        <div className="absolute top-0 left-0 w-20 h-20">
                          <svg
                            viewBox="0 0 100 100"
                            className={`w-full h-full ${isWorkout ? "text-[#ede9fe]" : "text-[#ffe4e6]"}`}
                          >
                            <path d="M0,0 L0,100 L100,0 Z" fill="currentColor" />
                          </svg>
                        </div>
                        <h4
                          className={`font-semibold flex items-center gap-2 mb-2 relative z-10 ${
                            isWorkout ? "text-[#6d28d9]" : "text-[#be123c]"
                          }`}
                        >
                          <FaHeartbeat className="animate-pulse" /> Cooldown
                        </h4>
                        <p className={`relative z-10 ${isWorkout ? "text-[#5b21b6]" : "text-[#9f1239]"}`}>
                          {selectedDay.cooldown}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 py-4">
                    {/* Diet Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div
                        className={`p-4 rounded-lg border relative overflow-hidden group ${
                          isWorkout ? "bg-[#f5f3ff] border-[#ddd6fe]" : "bg-[#fff1f2] border-[#fecdd3]"
                        }`}
                      >
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/50 group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex flex-col items-center justify-center relative z-10">
                          <div className="w-12 h-12 rounded-full bg-[#fff7ed] flex items-center justify-center mb-2">
                            <FaFire className="text-[#f97316] text-xl animate-flicker" />
                          </div>
                          <p className="text-sm text-gray-500">Total Calories</p>
                          <p className="text-xl font-bold text-gray-800">{selectedDay.totalCalories || 0} kcal</p>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg border relative overflow-hidden group ${
                          isWorkout ? "bg-[#f5f3ff] border-[#ddd6fe]" : "bg-[#fff1f2] border-[#fecdd3]"
                        }`}
                      >
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/50 group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex flex-col items-center justify-center relative z-10">
                          <div className="w-12 h-12 rounded-full bg-[#eff6ff] flex items-center justify-center mb-2">
                            <FaWeight className="text-[#2563eb] text-xl animate-bounce-subtle" />
                          </div>
                          <p className="text-sm text-gray-500">Macros (P/C/F)</p>
                          <p className="text-xl font-bold text-gray-800">
                            {selectedDay.totalProtein || 0}g / {selectedDay.totalCarbs || 0}g /{" "}
                            {selectedDay.totalFats || 0}g
                          </p>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg border relative overflow-hidden group ${
                          isWorkout ? "bg-[#f5f3ff] border-[#ddd6fe]" : "bg-[#fff1f2] border-[#fecdd3]"
                        }`}
                      >
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/50 group-hover:scale-150 transition-transform duration-500" />
                        <div className="flex flex-col items-center justify-center relative z-10">
                          <div className="w-12 h-12 rounded-full bg-[#ecfdf5] flex items-center justify-center mb-2 relative">
                            <FaWater className="text-[#0ea5e9] text-xl" />
                            <span className="absolute w-full h-full rounded-full border-2 border-[#a5f3fc] animate-ping-slow" />
                          </div>
                          <p className="text-sm text-gray-500">Water Intake</p>
                          <p className="text-xl font-bold text-gray-800">{selectedDay.waterIntake || 0}L</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700 text-lg flex items-center">
                        <FaUtensils className={`mr-2 ${isWorkout ? "text-[var(--violet)]" : "text-[#f43f5e]"}`} />
                        Meals
                      </h4>
                      {selectedDay.meals?.map((meal: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
                            isWorkout ? "hover:border-[#c4b5fd]" : "hover:border-[#fda4af]"
                          }`}
                        >
                          {/* Background decoration */}
                          <div
                            className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${
                              isWorkout ? "bg-[#f5f3ff]" : "bg-[#fff1f2]"
                            } group-hover:scale-150 transition-transform duration-500 opacity-70`}
                          />

                          <div className="flex items-start gap-3 relative z-10">
                            <div
                              className={`w-12 h-12 rounded-lg ${
                                isWorkout ? "bg-[#ede9fe]" : "bg-[#ffe4e6]"
                              } flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                            >
                              <FaAppleAlt
                                className={`text-xl ${
                                  isWorkout ? "text-[var(--violet)]" : "text-[#f43f5e]"
                                } group-hover:rotate-12 transition-transform duration-300`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-gray-800">{meal.name || "Unnamed Meal"}</h5>
                                <Badge
                                  variant="outline"
                                  className={`${
                                    isWorkout ? "bg-[#f5f3ff] border-[#ddd6fe]" : "bg-[#fff1f2] border-[#fecdd3]"
                                  }`}
                                >
                                  {meal.time || "N/A"}
                                </Badge>
                              </div>

                              <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                                <p className="font-medium text-gray-700 mb-1">Foods:</p>
                                <p className="text-gray-600">{meal.foods?.join(", ") || "No foods listed"}</p>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                <div className="text-center p-2 bg-[#fff7ed] rounded-md border border-[#ffedd5] group-hover:bg-[#ffe4c4] transition-colors duration-300">
                                  <p className="text-xs text-gray-500">Calories</p>
                                  <p className="font-semibold text-[#ea580c]">{meal.calories || 0} kcal</p>
                                </div>
                                <div className="text-center p-2 bg-[#fef2f2] rounded-md border border-[#fee2e2] group-hover:bg-[#fecaca] transition-colors duration-300">
                                  <p className="text-xs text-gray-500">Protein</p>
                                  <p className="font-semibold text-[#dc2626]">{meal.protein || 0}g</p>
                                </div>
                                <div className="text-center p-2 bg-[#fffbeb] rounded-md border border-[#fef3c7] group-hover:bg-[#fde68a] transition-colors duration-300">
                                  <p className="text-xs text-gray-500">Carbs</p>
                                  <p className="font-semibold text-[#d97706]">{meal.carbs || 0}g</p>
                                </div>
                                <div className="text-center p-2 bg-[#eff6ff] rounded-md border border-[#dbeafe] group-hover:bg-[#bfdbfe] transition-colors duration-300">
                                  <p className="text-xs text-gray-500">Fats</p>
                                  <p className="font-semibold text-[#2563eb]">{meal.fats || 0}g</p>
                                </div>
                              </div>

                              {meal.notes && (
                                <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                                  {meal.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className={isWorkout ? "hover:bg-[#f5f3ff]" : "hover:bg-[#fff1f2]"}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}