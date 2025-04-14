import { Workout } from "@/types/Workouts";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  FlameIcon, 
  Eye, 
  Pencil, 
  ChevronRight, 
  Activity,
  Zap,
  Target,
  BarChart4,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface WorkoutCardProps {
  workout: Workout;
}

const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return <Target className="h-3 w-3 mr-1" />;
      case "intermediate":
        return <BarChart4 className="h-3 w-3 mr-1" />;
      case "advanced":
        return <FlameIcon className="h-3 w-3 mr-1" />;
      default:
        return <Activity className="h-3 w-3 mr-1" />;
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-emerald-500 text-white";
      case "intermediate":
        return "bg-indigo-500 text-white";
      case "advanced":
        return "bg-rose-500 text-white";
      default:
        return "bg-primary text-white";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
        <div className="relative">
          {/* Background decoration elements */}
          <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
            <motion.div 
              className="absolute w-20 h-20 rounded-full bg-purple-400/40 blur-md"
              animate={{
                x: isHovered ? [0, 10, 0] : 0,
                y: isHovered ? [0, -5, 0] : 0,
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              style={{ top: '10%', left: '10%' }}
            />
            <motion.div 
              className="absolute w-24 h-24 rounded-full bg-blue-400/40 blur-md"
              animate={{
                x: isHovered ? [0, -15, 0] : 0,
                y: isHovered ? [0, 10, 0] : 0,
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              style={{ bottom: '5%', right: '15%' }}
            />
          </div>
          
          {/* Image with hover effect */}
          <div className="w-full h-48 overflow-hidden">
            <motion.img
              src={workout.imageUrl || "/api/placeholder/600/400"}
              alt={workout.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.07 : 1 }}
              transition={{ duration: 0.7 }}
            />
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {workout.isPremium && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-full font-medium flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 fill-current" strokeWidth={2.5} /> Premium
                </Badge>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className={`${getDifficultyColor(workout.difficulty)} px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
                {getDifficultyIcon(workout.difficulty)}
                {workout.difficulty}
              </Badge>
            </motion.div>
          </div>
        </div>
        
        <CardContent className="pt-4 pb-2 relative">
          <motion.h3 
            className="text-lg font-bold mb-1 line-clamp-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {workout.title}
          </motion.h3>
          
          <motion.p 
            className="text-muted-foreground text-sm mb-3 line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {workout.description}
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg my-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-sky-500" strokeWidth={2} />
              <span className="font-medium">{workout.duration} min</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500" strokeWidth={2} />
              <span className="font-medium">{workout.exercises.length} exercises</span>
            </div>
          </motion.div>

          {/* Exercise preview with animations */}
          {workout.exercises && workout.exercises.length > 0 && (
            <motion.div 
              className="mt-3 space-y-2 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center text-sm">
                <motion.div 
                  className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Activity className="h-3 w-3 text-indigo-600" />
                </motion.div>
                <div className="ml-2 truncate font-medium">{workout.exercises[0].name || "First Exercise"}</div>
              </div>
              
              {workout.exercises.length > 1 && (
                <div className="text-xs font-medium flex items-center text-indigo-600 pl-8">
                  +{workout.exercises.length - 1} more exercises
                  <motion.div
                    animate={{ x: isHovered ? 3 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 pb-4 px-4 flex justify-between gap-3">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm rounded-full font-medium transition-all duration-300 hover:shadow-md"
            asChild
          >
            <Link to={`/admin/workouts/${workout.id}`}>
              <Eye className="h-4 w-4 mr-2" strokeWidth={2} />
              View Workout
              <motion.div
                animate={{ x: isHovered ? 3 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="ml-1 h-4 w-4" strokeWidth={2} />
              </motion.div>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-gray-200 hover:bg-gray-50 rounded-full font-medium transition-all duration-300 hover:border-gray-300"
            asChild
          >
            <Link to={`/admin/workouts/edit/${workout.id}`}>
              <Pencil className="h-4 w-4 mr-2" strokeWidth={2} />
              Edit
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default WorkoutCard;