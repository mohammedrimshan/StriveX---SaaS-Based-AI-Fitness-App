// D:\StriveX\client\src\components\ProgressTracker.tsx
import React from "react";
import { CheckCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";
import {  WorkoutDetailsPro } from "@/types/Workouts";

interface ProgressTrackerProps {
  totalExercises: number;
  completedExercises: number;
  currentExerciseIndex: number;
  exerciseProgress: { exerciseId: string; videoProgress: number; status: string }[];
  workout: WorkoutDetailsPro; // Change to WorkoutDetailsPro
}

// ProgressTracker.tsx
const ProgressTracker: React.FC<ProgressTrackerProps> = React.memo(({
  totalExercises,
  completedExercises,
  currentExerciseIndex,
  exerciseProgress,
  workout,
}) => {
  const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

  const overallProgress =
    exerciseProgress.length > 0
      ? Math.round(
          exerciseProgress.reduce((sum, ep) => sum + ep.videoProgress, 0) / totalExercises
        )
      : 0;

  return (
    <motion.div
      className="bg-white p-4 rounded-xl shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{
        backgroundColor: "white",
        padding: "1rem",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-violet-800 font-medium">Progress</h3>
        <span className="text-violet-600 text-sm font-medium">
          {completedExercises} / {totalExercises}
        </span>
      </div>
      <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-violet-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            height: "100%",
            backgroundColor: "var(--violet)",
            borderRadius: "9999px",
            width: `${overallProgress}%`,
          }}
        ></motion.div>
      </div>

      <div className="flex justify-between mt-4 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex space-x-1 min-w-0">
          {workout.exercises.map((exercise, index) => {
            const exerciseId = exercise.id || exercise._id;
            if (!exerciseId || !isValidObjectId(exerciseId)) {
              console.error("Invalid exerciseId in ProgressTracker:", exercise);
              return null;
            }
            const progress = exerciseProgress.find((ep) => ep.exerciseId === exerciseId);
            const isCompleted = progress?.status === "Completed";
            const isCurrent = index === currentExerciseIndex;

            return (
              <div key={exerciseId} className="flex flex-col items-center">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-violet-600" />
                ) : isCurrent ? (
                  <Circle className="h-5 w-5 text-violet-400" fill="rgba(139, 92, 246, 0.2)" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
                <span className="text-[10px] text-gray-500 mt-1">{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});

export default ProgressTracker;