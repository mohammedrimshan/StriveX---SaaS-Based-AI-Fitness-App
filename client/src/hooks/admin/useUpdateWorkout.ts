import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkout } from "@/services/admin/adminService";
import { IWorkoutEntity } from "@/types/Workouts";

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IWorkoutEntity,
    Error,
    { workoutId: string; workoutData: Partial<IWorkoutEntity>; files?: { image?: string; music?: string } }
  >({
    mutationFn: ({ workoutId, workoutData, files }) => updateWorkout(workoutId, workoutData, files),
    onSuccess: (data) => {
      // Invalidate and refetch all workouts after updating
      queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
      // Optionally invalidate specific workout category
      queryClient.invalidateQueries({ queryKey: ["workoutsByCategory", data.category] });
    },
  });
};