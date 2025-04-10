import { Workout } from "@/types/Workouts";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, Edit, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  workout: Workout;
}

const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "difficulty-beginner";
      case "Intermediate":
        return "difficulty-intermediate";
      case "Advanced":
        return "difficulty-advanced";
      default:
        return "bg-primary";
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg animate-zoom-in glass-card bg-white/5 backdrop-blur-sm">
      <div className="relative">
        <img
          src={workout.imageUrl || "https://placehold.co/600x400/9089fc/ffffff?text=Workout"}
          alt={workout.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {workout.isPremium && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Star className="h-3 w-3 mr-1 fill-current" /> Premium
            </Badge>
          )}
          <Badge className={cn("text-white", getDifficultyClass(workout.difficulty))}>
            {workout.difficulty}
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{workout.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {workout.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{workout.duration} min</span>
          </div>
          <div className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-1" />
            <span>{workout.exercises.length} exercises</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/workouts/${workout.id}`}>
            View Details
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/workouts/edit/${workout.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;
