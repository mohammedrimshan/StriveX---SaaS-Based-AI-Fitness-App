import { useQuery } from "@tanstack/react-query";
import { getAllWorkouts } from "@/services/client/clientService";
import { PaginatedResult, IWorkoutEntity } from "@/types/Workouts";

export const useAllWorkouts = (page: number = 1, limit: number = 10, filter: object = {}) => {
  return useQuery<PaginatedResult<IWorkoutEntity>, Error>({
    queryKey: ["allWorkouts", page, limit, filter],
    queryFn: () => getAllWorkouts(page, limit, filter),
  });
};