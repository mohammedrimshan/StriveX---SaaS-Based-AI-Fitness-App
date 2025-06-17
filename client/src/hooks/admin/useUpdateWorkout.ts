import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkout, WorkoutResponse } from "@/services/admin/adminService";
import { Workout as IWorkoutEntity } from "@/types/Workouts";

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<
  WorkoutResponse,
  Error,
  { workoutId: string; workoutData: Partial<IWorkoutEntity>; files?: { image?: string; music?: string } }
>({
  mutationFn: ({ workoutId, workoutData, files }) =>
    updateWorkout(workoutId, workoutData, files),
  onSuccess: (response) => {
    const updatedWorkout = response.data;
    queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
    queryClient.invalidateQueries({
      queryKey: ["workoutsByCategory", updatedWorkout.category],
    });
  },
});

};