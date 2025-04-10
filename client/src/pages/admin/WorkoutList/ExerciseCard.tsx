import { Exercise } from "@/types/Workouts";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Film } from "lucide-react";
import { Link } from "react-router-dom";

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
}

const ExerciseCard = ({ exercise, workoutId }: ExerciseCardProps) => {
  return (
    <Card className="h-full flex flex-col bg-white/5 backdrop-blur-sm border-gray-100/20 animate-fade-in transition-all duration-300 hover:shadow-md">
      <CardContent className="flex-1 pt-4">
        <h3 className="text-lg font-medium mb-2">{exercise.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {exercise.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{exercise.duration} sec</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Rest: {exercise.defaultRestDuration} sec</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 gap-2">
        {exercise.videoUrl && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
              <Film className="h-4 w-4 mr-1" />
              Video
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/workouts/${workoutId}/exercises/edit/${exercise.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExerciseCard;