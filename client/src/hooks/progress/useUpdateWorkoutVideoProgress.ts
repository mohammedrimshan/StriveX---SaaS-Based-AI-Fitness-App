import { useMutation } from "@tanstack/react-query";
import { updateWorkoutVideoProgress, UpdateWorkoutVideoProgressData } from "@/services/progress/workoutProgressService";

export const useUpdateWorkoutVideoProgress = () => {
  return useMutation({
    mutationFn: ({
      workoutId,
      videoProgress,
      status,
      completedExercises,
      userId,
      exerciseId,
    }: {
      workoutId: string;
      videoProgress: number;
      status: "Not Started" | "In Progress" | "Completed";
      completedExercises?: string[];
      userId: string;
      exerciseId: string; 
    }) => {
      // Ensure status is valid before making API call
      if (!status || !["Not Started", "In Progress", "Completed"].includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      // Include exerciseId in the data object
      const data: UpdateWorkoutVideoProgressData = {
        workoutId,
        videoProgress,
        status,
        completedExercises,
        userId,
        exerciseId, 
      };

      return updateWorkoutVideoProgress(data);
    },
    mutationKey: ["updateWorkoutVideoProgress"],
  });
};