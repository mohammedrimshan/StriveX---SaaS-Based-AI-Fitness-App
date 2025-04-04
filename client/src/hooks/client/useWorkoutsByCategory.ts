import { useQuery } from "@tanstack/react-query";
import { getWorkoutsByCategory } from "@/services/client/clientService";
import { IWorkoutEntity } from "@/types/Workouts";

export const useWorkoutsByCategory = (categoryId: string) => {
  return useQuery<IWorkoutEntity[], Error>({
    queryKey: ["workoutsByCategory", categoryId],
    queryFn: () => getWorkoutsByCategory(categoryId),
    enabled: !!categoryId, 
  });
};