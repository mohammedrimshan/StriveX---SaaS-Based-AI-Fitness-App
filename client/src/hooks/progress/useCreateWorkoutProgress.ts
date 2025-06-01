import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createWorkoutProgress, 
  CreateWorkoutProgressData, 
  IWorkoutProgressEntity 
} from "@/services/progress/workoutProgressService";

export const useCreateWorkoutProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<IWorkoutProgressEntity, Error, CreateWorkoutProgressData>({
    mutationFn: (data: CreateWorkoutProgressData) => {
      if (!data.userId) {
        console.error("userId is required in createWorkoutProgress");
        return Promise.reject(new Error("userId is required"));
      }
      
      console.log("Creating workout progress from hook with data:", data);
      return createWorkoutProgress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userWorkoutProgress"] });
    },
    onError: (error) => {
      console.error("Error creating workout progress:", error);
    }
  });
};