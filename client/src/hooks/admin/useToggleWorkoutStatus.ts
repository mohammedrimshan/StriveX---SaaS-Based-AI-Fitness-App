import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleWorkoutStatus, WorkoutResponse } from "@/services/admin/adminService";

export const useToggleWorkoutStatus = () => {
  const queryClient = useQueryClient();

return useMutation<WorkoutResponse, Error, string>({
  mutationFn: (workoutId) => toggleWorkoutStatus(workoutId),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
    queryClient.invalidateQueries({ queryKey: ["workoutsByCategory", data.category] });
  },
});

};