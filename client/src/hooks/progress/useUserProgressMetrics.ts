// src/hooks/useUserProgressMetrics.ts
import { useQuery } from "@tanstack/react-query";
import { getUserProgressMetrics } from "@/services/progress/workoutProgressService";
import { ProgressMetricsResponse } from "@/types/progressMetrics";

interface UserProgressMetricsError {
  message: string;
}

export const useUserProgressMetrics = (userId: string) => {
  return useQuery<ProgressMetricsResponse, Error & { response?: { data: UserProgressMetricsError } }>({
    queryKey: ["userProgressMetrics", userId],
    queryFn: () => getUserProgressMetrics(userId),
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};