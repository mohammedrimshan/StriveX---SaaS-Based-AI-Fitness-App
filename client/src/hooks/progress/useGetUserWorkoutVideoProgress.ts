
import { useQuery } from "@tanstack/react-query";
import { getUserWorkoutVideoProgress } from "@/services/progress/workoutProgressService";
import { WorkoutVideoProgressResponse } from "@/types/Progress";

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

export const useGetUserWorkoutVideoProgress = (userId: string) => {
  return useQuery<WorkoutVideoProgressResponse, Error>({
    queryKey: ["userWorkoutVideoProgress", userId],
    queryFn: async () => {
      const data = await getUserWorkoutVideoProgress(userId);
      return {
        items: data,
        total: data.length,
        success: true,
        message: "Success",
      };
    },
    enabled: !!userId && isValidObjectId(userId),
  });
};