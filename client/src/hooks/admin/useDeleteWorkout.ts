import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "@/services/admin/adminService";
import { IAxiosResponse } from "@/types/Response";

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<IAxiosResponse, Error, string>({
    mutationFn: (workoutId) => deleteWorkout(workoutId),
    onSuccess: () => {
      // Invalidate and refetch all workouts after deletion
      queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
    },
  });
};