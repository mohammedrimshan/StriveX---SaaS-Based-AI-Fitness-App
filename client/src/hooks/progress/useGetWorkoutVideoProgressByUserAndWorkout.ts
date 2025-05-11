import { useQuery } from "@tanstack/react-query";
import { getWorkoutVideoProgressByUserAndWorkout } from "@/services/progress/workoutProgressService";

export const useGetWorkoutVideoProgressByUserAndWorkout = (userId: string, workoutId: string) => {
  return useQuery({
    queryKey: ["workoutVideoProgressByUserAndWorkout", userId, workoutId],
    queryFn: () => getWorkoutVideoProgressByUserAndWorkout(userId, workoutId),
    enabled: !!userId && !!workoutId,
  });
};