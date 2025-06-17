import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkoutById, WorkoutExercise } from "@/services/admin/adminService";
import ExerciseCard from "./ExerciseCard";
import PaginationControls from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Edit,
  Plus,
  Star,
  Tag,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddExerciseForm from "./AddExerciseForm";
import { useWorkouts } from "@/hooks/admin/useWorkouts";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedButton from "@/components/Animation/AnimatedButton";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import { motion } from "framer-motion";

// Utility function to convert seconds to time
const secondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    result += `${result ? ' ' : ''}${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  if (remainingSeconds > 0) {
    result += `${result ? ' ' : ''}${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  return result || '0 minutes';
};

// Calculate total workout duration from exercises
const calculateWorkoutDuration = (exercises: WorkoutExercise[]): number => {
  let totalDuration = 0;
  exercises.forEach((exercise, index) => {
    totalDuration += exercise.duration;
    if (index < exercises.length - 1) {
      totalDuration += exercise.defaultRestDuration;
    }
  });
  return totalDuration;
};

const WorkoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { deleteExercise } = useWorkouts();

  const { 
    data: workoutData, 
    isLoading,
    error
  } = useQuery({
    queryKey: ["workout", id],
    queryFn: () => id ? getWorkoutById(id) : Promise.reject("No workout ID"),
    enabled: !!id,
  });

  const workout = workoutData?.data;
  const displayDuration = workout?.exercises ? calculateWorkoutDuration(workout.exercises) : workout?.duration || 0;
  console.log("Raw workout data:", workout, "Calculated duration:", displayDuration);
  
  useEffect(() => {
    if (workout?.exercises) {
      const ITEMS_PER_PAGE = 6;
      setTotalPages(Math.ceil(workout.exercises.length / ITEMS_PER_PAGE));
    }
  }, [workout]);

  const getPaginatedExercises = (): WorkoutExercise[] => {
    if (!workout || !workout.exercises) return [];
    
    const ITEMS_PER_PAGE = 6;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return workout.exercises.slice(startIndex, endIndex).map(exercise => ({
      ...exercise,
      id: exercise?._id || exercise.id,
      videoUrl: exercise.videoUrl
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!id) return;
    
    try {
      await deleteExercise({ workoutId: id, exerciseId });
      queryClient.invalidateQueries({ queryKey: ["workout", id] });
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500 hover:bg-green-600";
      case "Intermediate":
        return "bg-orange-500 hover:bg-orange-600";
      case "Advanced":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-primary";
    }
  };

  if (isLoading) {
    return (
      <div className="mt-20 animate-pulse space-y-6 p-6">
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="mt-20 text-center py-12">
        <h3 className="text-lg font-semibold">Workout not found</h3>
        <p className="mt-2 text-muted-foreground">
          The workout you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild className="mt-4">
          <Link to="/admin/workouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workouts
          </Link>
        </Button>
      </div>
    );
  }

  const exercises = getPaginatedExercises();

  return (
    <AnimatedBackground>
      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center mb-6"
        >
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/admin/workouts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          
          <div className="flex-grow">
            <AnimatedTitle 
              title={workout.title} 
              subtitle={`${workout.difficulty} workout - ${secondsToTime(displayDuration)}`}
            />
          </div>
          
          <AnimatedButton 
            text="Edit Workout"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => window.location.href = `/admin/workouts/edit/${workout.id || workout._id}`}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="lg:col-span-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-lg overflow-hidden relative shadow-xl h-full"
            >
              <img
                src={workout.imageUrl || "https://placehold.co/800x400/9089fc/ffffff?text=Workout+Image"}
                alt={workout.title}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-6 z-20"
              >
                <div className="prose max-w-none text-white">
                  <p className="text-lg mb-0">{workout.description}</p>
                </div>
              </motion.div>
              
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                {workout.isPremium && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Premium
                  </Badge>
                )}
                <Badge className={getDifficultyColor(workout.difficulty)}>
                  {workout.difficulty}
                </Badge>
              </div>
            </motion.div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg p-6 h-full shadow-lg border border-indigo-100"
          >
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Workout Details
            </h3>
            <div className="space-y-6">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center"
              >
                <div className="bg-indigo-100 p-2 rounded-full mr-4">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-lg">{secondsToTime(displayDuration)}</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center"
              >
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exercises</p>
                  <p className="font-medium text-lg">{workout.exercises?.length || 0} exercises</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center"
              >
                <div className="bg-pink-100 p-2 rounded-full mr-4">
                  <Tag className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-lg">{workout.category || "Strength Training"}</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center"
              >
                <div className="bg-indigo-100 p-2 rounded-full mr-4">
                  <Star className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={workout.status ? "default" : "secondary"} className={workout.status ? "bg-green-500" : "bg-gray-400"}>
                    {workout.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Exercises
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <AnimatedButton 
                text="Add Exercise"
                icon={<Plus className="h-4 w-4" />}
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Exercise</DialogTitle>
              </DialogHeader>
              {id && (
                <AddExerciseForm 
                  workoutId={id} 
                  onSuccess={() => {
                    setDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["workout", id] });
                  }} 
                />
              )}
            </DialogContent>
          </Dialog>
        </motion.div>

        {(!workout.exercises || workout.exercises.length === 0) ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-lg shadow-inner border border-indigo-100"
          >
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Dumbbell className="mx-auto h-16 w-16 text-indigo-300" />
            </motion.div>
            <h3 className="mt-6 text-xl font-semibold text-indigo-600">No exercises found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              This workout doesn't have any exercises yet. Add your first exercise to get started!
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                </DialogHeader>
                {id && (
                  <AddExerciseForm 
                    workoutId={id} 
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["workout", id] });
                    }} 
                  />
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ExerciseCard
                    exercise={exercise}
                    workoutId={id || ""}
                    onDelete={() => exercise.id && handleDeleteExercise(exercise.id)}
                  />
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default WorkoutDetailPage;