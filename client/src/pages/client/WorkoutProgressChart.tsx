"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { format } from "date-fns"
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  BarChart3, 
  Activity,
  Flame,
  Award,
  Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetUserWorkoutVideoProgress } from "@/hooks/progress/useGetUserWorkoutVideoProgress"
import { RootState } from "@/store/store"

// Types for our data structure
interface ExerciseDetails {
  _id: string;
  name: string;
  description: string;
  duration: number;
  videoUrl: string;
  defaultRestDuration: number;
}

interface ExerciseProgress {
  _id: string;
  exerciseId: string;
  videoProgress: number;
  status: string;
  lastUpdated: string;
  clientTimestamp: string;
  exerciseDetails: ExerciseDetails;
}

interface WorkoutProgress {
  _id: string;
  workoutId: string;
  userId: string;
  completedExercises: string[];
  createdAt: string;
  exerciseProgress: ExerciseProgress[];
  lastUpdated: string;
  updatedAt: string;
}

interface WorkoutProgressData {
  status: string;
  data: {
    items: WorkoutProgress[];
    total: number;
  };
  message: string;
}

// Custom badge component props
interface CustomBadgeProps {
  variant: "success" | "secondary" | "destructive" | "outline";
  children: React.ReactNode;
  className?: string;
}

export default function WorkoutProgressDashboard() {
  const userId = useSelector((state: RootState) => state.client.client?.id)
  const { data: progressData, isLoading, error } = useGetUserWorkoutVideoProgress(userId || "");
  
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({})
  const [progressValues, setProgressValues] = useState<Record<string, number>>({})
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    // Set initial progress values to 0 for animation
    if (progressData?.data?.items) {
      const initialProgressValues: Record<string, number> = {}
      progressData.data.items.forEach((workout: WorkoutProgress) => {
        initialProgressValues[workout._id] = 0
      })
      setProgressValues(initialProgressValues)
      
      // Trigger animations after data is loaded
      setTimeout(() => {
        setShowAnimation(true)
        const finalProgressValues: Record<string, number> = {}
        progressData.data.items.forEach((workout: WorkoutProgress) => {
          finalProgressValues[workout._id] = calculateWorkoutCompletion(workout)
        })
        setProgressValues(finalProgressValues)
      }, 500)
    }
  }, [progressData])

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }))
  }

  // Calculate total workout completion percentage
  const calculateWorkoutCompletion = (workout: WorkoutProgress): number => {
    const totalExercises = workout.exerciseProgress.length
    if (totalExercises === 0) return 0
    
    const completedExercises = workout.exerciseProgress.filter((ex) => ex.status === "Completed").length
    return Math.round((completedExercises / totalExercises) * 100)
  }

  // Calculate total duration of a workout
  const calculateTotalDuration = (workout: WorkoutProgress): number => {
    return workout.exerciseProgress.reduce((total, ex) => total + (ex.exerciseDetails?.duration || 0), 0)
  }

  // Get a color based on completion status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500"
      case "In Progress":
        return "bg-amber-500"
      default:
        return "bg-slate-300"
    }
  }

  // Get a badge color based on completion status
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
      case "Completed":
        return "success"
      case "In Progress":
        return "secondary"
      default:
        return "outline"
    }
  }
  
  // Custom badge component with colors
  const CustomBadge: React.FC<CustomBadgeProps> = ({ variant, children, className = "" }) => {
    const getBgColor = () => {
      switch (variant) {
        case "success":
          return "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
        case "secondary":
          return "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
        case "destructive":
          return "bg-gradient-to-r from-red-500 to-rose-500 text-white"
        case "outline":
        default:
          return "bg-white-100 text-white-800 border border-white-200"
      }
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBgColor()} ${className}`}>
        {children}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg animate-pulse">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-medium text-white-600">Loading your workout progress...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-lg">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-medium text-white-800">Failed to load workout progress</h2>
          <p className="mt-2 text-white-600">Please try again later</p>
        </div>
      </div>
    )
  }

  // Check if there are no workouts
  if (!progressData?.data?.items || progressData.data.items.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-medium text-white-800">No workout progress yet</h2>
          <p className="mt-2 text-white-600">Complete your first workout to see your progress!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-gradient-to-br from-white-50 to-white-100 min-h-screen mt-10">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-2 mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg">
          <Flame className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Workout Progress</h1>
        <p className="text-white-600">Track your fitness journey and exercise completion</p>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-white-100 p-1 rounded-xl">
          <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            Progress Chart
          </TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            Workout Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2 bg-gradient-to-r from-white-50 to-white-100">
                <CardTitle className="text-xl flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-violet-600" />
                  Overall Completion
                </CardTitle>
                <CardDescription>Your workout completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-4">
                  <div className="relative h-48 w-48">
                    {progressData.data.items.map((workout: WorkoutProgress, index: number) => {
                      const completion = showAnimation ? progressValues[workout._id] || 0 : 0;
                      const offset = 100 - completion;
                      const circumference = 2 * Math.PI * 70;
                      const strokeDashoffset = (offset * circumference) / 100;

                      return (
                        <div key={workout._id} className="absolute inset-0 flex items-center justify-center">
                          <svg className="h-full w-full" viewBox="0 0 160 160">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth={index === 0 ? "12" : "8"}
                              className={index === 0 ? "" : "opacity-40"}
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              fill="none"
                              stroke={index === 0 ? "url(#gradient1)" : "url(#gradient2)"}
                              strokeWidth={index === 0 ? "12" : "8"}
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              transform="rotate(-90 80 80)"
                              className={`transition-all duration-1000 ease-out ${index === 0 ? "" : "opacity-70"}`}
                            />
                            <defs>
                              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#4f46e5" />
                              </linearGradient>
                              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                              </linearGradient>
                            </defs>
                          </svg>
                          {index === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                {Math.round(completion)}%
                              </span>
                              <span className="text-sm text-white-500">Completed</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {progressData.data.items.map((workout: WorkoutProgress, index: number) => (
                    <div key={workout._id} className="flex items-center p-2 rounded-lg bg-white-50 hover:bg-white-100 transition-colors duration-200">
                      <div
                        className={`h-3 w-3 rounded-full mr-2 ${
                          index === 0 ? "bg-gradient-to-r from-violet-500 to-indigo-600" : "bg-gradient-to-r from-emerald-500 to-green-500"
                        }`}
                      ></div>
                      <div className="text-sm">
                        <div className="font-medium">Workout {index + 1}</div>
                        <div className="text-white-500 text-xs">
                          {format(new Date(workout.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2 bg-gradient-to-r from-white-50 to-white-100">
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-violet-600" />
                  Exercise Breakdown
                </CardTitle>
                <CardDescription>Exercise completion by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 py-4">
                  {/* Group exercises by name across all workouts */}
                  {Array.from(
                    new Set(
                      progressData.data.items.flatMap((workout: WorkoutProgress) =>
                        workout.exerciseProgress.map((ex: ExerciseProgress) => ex.exerciseDetails?.name).filter(Boolean),
                      ),
                    ),
                  ).map((exerciseName: string, i: number) => {
                    // Find all instances of this exercise across workouts
                    const allExercises = progressData.data.items.flatMap((workout: WorkoutProgress) =>
                      workout.exerciseProgress.filter((ex: ExerciseProgress) => ex.exerciseDetails?.name === exerciseName),
                    )

                    const completedCount = allExercises.filter((ex: ExerciseProgress) => ex.status === "Completed").length
                    const totalCount = allExercises.length
                    const completionRate = (completedCount / totalCount) * 100
                    const animatedCompletionRate = showAnimation ? completionRate : 0;

                    return (
                      <div key={i} className="space-y-2 p-3 rounded-lg hover:bg-white-50 transition-colors duration-200">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">{exerciseName}</span>
                          <span className="text-sm text-white-500 font-medium">
                            {completedCount}/{totalCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 h-2 bg-white-100 rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out" 
                              style={{
                                width: `${animatedCompletionRate}%`,
                                background: `linear-gradient(to right, #8b5cf6, #4f46e5)`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            {Math.round(completionRate)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-white-50 to-white-100">
              <CardTitle className="text-xl flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-violet-600" />
                Recent Activity Timeline
              </CardTitle>
              <CardDescription>Your workout history and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 to-indigo-600"></div>
                <div className="space-y-8 relative pl-10">
                  {progressData.data.items.map((workout: WorkoutProgress, workoutIndex: number) => (
                    <div key={workout._id} className="relative opacity-0 animate-fadeIn" style={{animationDelay: `${workoutIndex * 300}ms`, animationFillMode: 'forwards'}}>
                      <div className="absolute -left-6 mt-1.5 h-4 w-4 rounded-full border border-violet-300 bg-white shadow-sm z-10"></div>
                      <div className="mb-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        {format(new Date(workout.createdAt), "MMMM d, yyyy")}
                      </div>
                      <div className="rounded-lg border border-white-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium flex items-center">
                            <Award className="h-4 w-4 mr-1 text-violet-500" />
                            Workout {workoutIndex + 1}
                          </div>
                          <CustomBadge variant={calculateWorkoutCompletion(workout) === 100 ? "success" : "secondary"}>
                            {calculateWorkoutCompletion(workout)}% Complete
                          </CustomBadge>
                        </div>
                        <div className="space-y-3 mt-4">
                          {workout.exerciseProgress.map((exercise: ExerciseProgress, exIndex: number) => (
                            <div 
                              key={exercise._id} 
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-white-50 transition-colors duration-200"
                            >
                              <div className={`h-2 w-2 rounded-full ${getStatusColor(exercise.status)}`}></div>
                              <div className="flex-1 text-sm">{exercise.exerciseDetails?.name || "Unknown Exercise"}</div>
                              <CustomBadge variant={getStatusBadgeVariant(exercise.status)}>{exercise.status}</CustomBadge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-6">
            {progressData.data.items.map((workout: WorkoutProgress, index: number) => {
              const isExpanded = expandedWorkouts[workout._id] || false
              const completionPercentage = calculateWorkoutCompletion(workout)
              const totalDuration = calculateTotalDuration(workout)
              const animatedCompletionPercentage = showAnimation ? completionPercentage : 0;

              return (
                <Card 
                  key={workout._id} 
                  className={`overflow-hidden border-0 shadow-lg bg-white rounded-xl transition-all duration-300 ${
                    isExpanded ? 'shadow-xl' : 'hover:shadow-xl'
                  }`}
                >
                  <CardHeader className="pb-2 bg-gradient-to-r from-white-50 to-white-100">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-violet-600" /> 
                        Workout {index + 1}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 p-0 hover:bg-violet-100 hover:text-violet-600 transition-colors duration-200"
                        onClick={() => toggleWorkout(workout._id)}
                        aria-label={isExpanded ? "Collapse workout details" : "Expand workout details"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    <CardDescription>
                      {format(new Date(workout.createdAt), "MMMM d, yyyy")} • {workout.exerciseProgress.length}{" "}
                      exercises
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-violet-500" />
                        <span className="text-sm text-white-600">
                          {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-violet-500" />
                        <span className="text-sm text-white-600">
                          {workout.exerciseProgress.filter((ex: ExerciseProgress) => ex.status === "Completed").length}/
                          {workout.exerciseProgress.length} completed
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-white-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${animatedCompletionPercentage}%`,
                          background: 'linear-gradient(to right, #8b5cf6, #4f46e5)'
                        }}
                      ></div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 space-y-4">
                        {workout.exerciseProgress.map((exercise: ExerciseProgress, exIndex: number) => (
                          <div
                            key={exercise._id}
                            className="p-4 rounded-lg border border-white-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md opacity-0 animate-fadeIn"
                            style={{animationDelay: `${exIndex * 100}ms`, animationFillMode: 'forwards'}}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{exercise.exerciseDetails?.name || "Unknown Exercise"}</h4>
                                <p className="text-sm text-white-500">{exercise.exerciseDetails?.description || ""}</p>
                              </div>
                              <CustomBadge variant={getStatusBadgeVariant(exercise.status)}>{exercise.status}</CustomBadge>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-violet-500" />
                                <span className="text-xs">
                                  {Math.floor((exercise.exerciseDetails?.duration || 0) / 60)}:
                                  {((exercise.exerciseDetails?.duration || 0) % 60).toString().padStart(2, "0")}
                                </span>
                              </div>

                              {exercise.status === "Completed" ? (
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
                                  <div className="h-1.5 bg-white-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full transition-all duration-1000 ease-out"
                                      style={{
                                        width: `${showAnimation ? exercise.videoProgress : 0}%`,
                                        background: 'linear-gradient(to right, #f59e0b, #d97706)'
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 text-xs gap-1 border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-colors duration-200"
                                >
                                  <Play className="h-3 w-3" /> Start Exercise
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className={isExpanded ? "pt-2" : "pt-0"}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-colors duration-200"
                      onClick={() => toggleWorkout(workout._id)}
                    >
                      {isExpanded ? "Show Less" : "Show Details"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add global styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}