import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleWorkoutStatus } from "@/services/admin/adminService";
import { IWorkoutEntity } from "@/types/Workouts";

export const useToggleWorkoutStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IWorkoutEntity, Error, string>({
    mutationFn: (workoutId) => toggleWorkoutStatus(workoutId),
    onSuccess: (data) => {
      // Invalidate and refetch all workouts after toggling status
      queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
      // Optionally invalidate specific workout category
      queryClient.invalidateQueries({ queryKey: ["workoutsByCategory", data.category] });
    },
  });
};