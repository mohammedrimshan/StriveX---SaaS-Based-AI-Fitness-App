import { useMutation } from "@tanstack/react-query";
import { updateWorkoutProgress } from "@/services/progress/workoutProgressService";
import { UpdateWorkoutProgressData } from "@/types/Progress";

export const useUpdateWorkoutProgress = () => {
  return useMutation({
    mutationKey: ["updateWorkoutProgress"],
    mutationFn: ({ progressId, data }: { progressId: string; data: UpdateWorkoutProgressData }) =>
      updateWorkoutProgress(progressId, data),
  });
};