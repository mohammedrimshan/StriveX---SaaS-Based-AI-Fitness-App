import { useQuery } from "@tanstack/react-query";
import { getUserWorkoutVideoProgress } from "@/services/progress/workoutProgressService";
import { IWorkoutVideoProgressEntity } from "@/services/progress/workoutProgressService";

export const useGetUserWorkoutVideoProgress = (userId: string) => {
  return useQuery<IWorkoutVideoProgressEntity[]>({
    queryKey: ["userWorkoutVideoProgress", userId],
    queryFn: () => getUserWorkoutVideoProgress(userId),
    enabled: !!userId,
  });
};