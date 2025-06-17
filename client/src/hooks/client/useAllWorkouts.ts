
import { useQuery } from "@tanstack/react-query";
import { getAllWorkouts } from "@/services/client/clientService";
import { PaginatedResponse } from "@/types/Response";
import { WorkoutDetailsPro } from "@/types/Workouts";

export const useAllWorkouts = (page: number = 1, limit: number = 10, filter: object = {}) => {
  return useQuery<PaginatedResponse<WorkoutDetailsPro>, Error>({
    queryKey: ["allWorkouts", page, limit, filter],
    queryFn: async () => {
      const response = await getAllWorkouts(page, limit, filter);
      return response as PaginatedResponse<WorkoutDetailsPro>;
    },
  });
};