import { useQuery } from "@tanstack/react-query";
import { getUserWorkoutProgress } from "@/services/progress/workoutProgressService";

export const useGetUserWorkoutProgress = (userId: string) => {
  return useQuery({
    queryKey: ["userWorkoutProgress", userId],
    queryFn: () => getUserWorkoutProgress(userId),
    enabled: !!userId,
  });
};