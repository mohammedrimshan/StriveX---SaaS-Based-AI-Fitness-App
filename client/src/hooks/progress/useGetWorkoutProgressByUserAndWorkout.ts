import { useQuery } from "@tanstack/react-query";
import { getWorkoutProgressByUserAndWorkout } from "@/services/progress/workoutProgressService";

export const useGetWorkoutProgressByUserAndWorkout = (userId: string, workoutId: string) => {
  return useQuery({
    queryKey: ["workoutProgressByUserAndWorkout", userId, workoutId],
    queryFn: () => getWorkoutProgressByUserAndWorkout(userId, workoutId),
    enabled: !!userId && !!workoutId,
  });
};