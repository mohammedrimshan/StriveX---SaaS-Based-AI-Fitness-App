import React from "react";
import { Award, CircleCheck, Crown, Dumbbell, Sparkles, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Workout } from "@/types/Workouts";
import { CategoryType } from "@/hooks/admin/useAllCategory";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

interface ReviewStepProps {
  workout: Workout;
  categories: CategoryType[];
  croppedImageUrl: string | null;
  onStatusChange: (status: boolean) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  workout,
  categories,
  croppedImageUrl,
  onStatusChange,
}) => {
  return (
    <motion.div
      className="space-y-6 form-section"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="text-2xl font-bold tracking-tight flex items-center"
        variants={itemVariants}
      >
        <CircleCheck className="mr-3 h-6 w-6 text-purple-600" />
        Review & Submit
      </motion.h2>
      <motion.div variants={itemVariants}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
              {workout.title}
            </CardTitle>
            <CardDescription className="flex items-center">
              <Award className="mr-2 h-4 w-4 text-purple-600" />
              {workout.difficulty} level • {workout.exercises.length} exercises • {workout.duration} min
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{workout.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <p className="mt-1">
                  {categories.find((c) => c._id === workout.category)?.title || "Uncategorized"}
                </p>
              </div>
              {croppedImageUrl && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Image</h3>
                  <div className="mt-1 aspect-video rounded-md overflow-hidden shadow-sm">
                    <img
                      src={croppedImageUrl}
                      alt={workout.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Exercises ({workout.exercises.length})
                </h3>
                <div className="mt-2 space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <motion.div
                      key={index}
                      className="bg-purple-50/70 p-3 rounded-md border-l-2 border-purple-300"
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium flex items-center">
                          <Dumbbell className="mr-2 h-3.5 w-3.5 text-purple-600" />
                          {exercise.name}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {exercise.duration} min • {exercise.defaultRestDuration}s rest
                        </div>
                      </div>
                      {exercise.videoUrl && (
                        <video
                          src={exercise.videoUrl}
                          controls
                          className="mt-2 w-full rounded-lg"
                          style={{ maxHeight: "150px" }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <Switch
                  id="status"
                  checked={workout.status}
                  onCheckedChange={onStatusChange}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="status" className="ml-2 flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-green-500" />
                  Active Workout
                </Label>
              </div>
              <div className="flex items-center p-3 rounded-md bg-gradient-to-r from-purple-50 to-indigo-50">
                {workout.isPremium ? (
                  <Crown className="h-5 w-5 text-amber-500 mr-2" />
                ) : (
                  <Zap className="h-5 w-5 text-green-500 mr-2" />
                )}
                <span className="text-sm">
                  {workout.isPremium ? "This is a premium workout" : "This is a free workout"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReviewStep;