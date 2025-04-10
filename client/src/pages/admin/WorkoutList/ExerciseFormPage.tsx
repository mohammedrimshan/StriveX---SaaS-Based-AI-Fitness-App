
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getExerciseById, getWorkoutById } from "./workoutData";
import { Exercise } from "@/types/Workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ExerciseFormPage = () => {
  const { workoutId, exerciseId } = useParams<{
    workoutId: string;
    exerciseId: string;
  }>();
  const navigate = useNavigate();
  const isEditMode = !!exerciseId;

  const [workoutTitle, setWorkoutTitle] = useState("");
  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: "",
    description: "",
    duration: 60,
    videoUrl: "",
    defaultRestDuration: 30,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!workoutId) return;
    
    setIsLoading(true);
    
    // Get workout title
    setTimeout(() => {
      const workout = getWorkoutById(workoutId);
      if (workout) {
        setWorkoutTitle(workout.title);
      }
      
      // If editing, get exercise data
      if (isEditMode && exerciseId) {
        const exercise = getExerciseById(exerciseId);
        if (exercise) {
          setFormData({
            name: exercise.name,
            description: exercise.description,
            duration: exercise.duration,
            videoUrl: exercise.videoUrl,
            defaultRestDuration: exercise.defaultRestDuration,
          });
        }
      }
      
      setIsLoading(false);
    }, 500);
  }, [workoutId, exerciseId, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      toast.success(
        isEditMode
          ? "Exercise updated successfully!"
          : "Exercise added successfully!"
      );
      setIsSaving(false);
      navigate(`/workouts/${workoutId}`);
    }, 1000);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to={`/workouts/${workoutId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Exercise" : "Add Exercise"}
        </h1>
      </div>
      
      <p className="text-muted-foreground mb-6">
        {workoutTitle ? `Workout: ${workoutTitle}` : "Loading workout..."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl animate-fade-in">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min={1}
                value={formData.duration}
                onChange={handleNumberChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRestDuration">Rest Duration (seconds)</Label>
              <Input
                id="defaultRestDuration"
                name="defaultRestDuration"
                type="number"
                min={0}
                value={formData.defaultRestDuration}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button variant="outline" type="button" asChild>
            <Link to={`/workouts/${workoutId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving} className="min-w-[120px] animate-gradient-shift bg-gradient-to-r from-primary to-purple-600">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditMode ? "Update Exercise" : "Add Exercise"
            )}
          </Button>
        </div>
      </form>
      </>
  )
};

export default ExerciseFormPage;
