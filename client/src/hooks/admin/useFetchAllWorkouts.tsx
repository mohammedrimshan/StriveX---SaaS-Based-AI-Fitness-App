import { useQuery } from "@tanstack/react-query";
import { getAllWorkouts, WorkoutsPaginatedResponse } from "@/services/admin/adminService";

export const useAllWorkouts = (
  page: number = 1,
  limit: number = 10,
  filter: object = {}
) => {
  return useQuery<WorkoutsPaginatedResponse, Error>({
    queryKey: ["allWorkouts", page, limit, filter],
    queryFn: () => getAllWorkouts({ page, limit, filter }),
  });
};
