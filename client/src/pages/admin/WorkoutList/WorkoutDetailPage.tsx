import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getWorkoutById, getExercisesByWorkoutId } from "./workoutData";
import { Exercise, Workout } from "@/types/Workouts";
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

const WorkoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Simulate API call with delay
    setIsLoading(true);
    const timer = setTimeout(() => {
      const workoutData = getWorkoutById(id);
      if (workoutData) {
        setWorkout(workoutData);
        
        const exercisesData = getExercisesByWorkoutId(id, currentPage, 6);
        setExercises(exercisesData.items);
        setTotalPages(exercisesData.totalPages);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!workout) {
    return (
      <>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Workout not found</h3>
          <p className="mt-2 text-muted-foreground">
            The workout you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-4">
            <Link to="/workouts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workouts
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-fitness-pattern opacity-5"></div>
        <div className="absolute inset-0 animated-gradient-bg opacity-5"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/workouts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex-grow">
            {workout.title}
          </h1>
          <Button asChild>
            <Link to={`/workouts/edit/${workout.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Workout
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden h-64 mb-4 relative">
              <img
                src={workout.imageUrl || "https://placehold.co/800x400/9089fc/ffffff?text=Workout+Image"}
                alt={workout.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex flex-col gap-2">
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
            </div>
            <div className="prose max-w-none">
              <p className="text-lg">{workout.description}</p>
            </div>
          </div>

          <div className="bg-accent/80 backdrop-blur-sm rounded-lg p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4">Workout Details</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{workout.duration} minutes</p>
                </div>
              </div>
              <div className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Exercises</p>
                  <p className="font-medium">{workout.exercises.length} exercises</p>
                </div>
              </div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">Strength Training</p>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={workout.status ? "default" : "secondary"}>
                    {workout.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Exercises</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="animate-gradient-shift bg-gradient-to-r from-primary to-purple-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Exercise</DialogTitle>
              </DialogHeader>
              <AddExerciseForm 
                workoutId={workout.id} 
                onSuccess={() => {
                  setDialogOpen(false);
                  // Refresh exercises
                  const exercisesData = getExercisesByWorkoutId(id!, currentPage, 6);
                  setExercises(exercisesData.items);
                  setTotalPages(exercisesData.totalPages);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-12 bg-accent/50 backdrop-blur-sm rounded-lg">
            <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No exercises found</h3>
            <p className="mt-2 text-muted-foreground">
              This workout doesn't have any exercises yet.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                </DialogHeader>
                <AddExerciseForm 
                  workoutId={workout.id} 
                  onSuccess={() => {
                    setDialogOpen(false);
                    // Refresh exercises
                    const exercisesData = getExercisesByWorkoutId(id!, currentPage, 6);
                    setExercises(exercisesData.items);
                    setTotalPages(exercisesData.totalPages);
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  workoutId={workout.id}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
      </>
  );
};

export default WorkoutDetailPage;