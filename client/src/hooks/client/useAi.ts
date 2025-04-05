// src/hooks/client/usePlanMutations.ts
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { generateWorkoutPlan, generateDietPlan } from '@/services/client/clientService';
import axios from 'axios'; // Add this import

export const usePlanMutations = () => {
  const client = useSelector((state: RootState) => state.client.client);
  const queryClient = useQueryClient();
  const userId = client?.clientId;

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', userId] });
      queryClient.invalidateQueries({ queryKey: ['dietPlans', userId] });
    },
    onError: (error: unknown) => {
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        // Prioritize Axios error response data
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Operation failed:", errorMessage);
      throw new Error(errorMessage);
    },
  };

  const generateWorkout = useMutation({
    mutationFn: (data: any) => {
      if (!userId) throw new Error("User not authenticated");
      return generateWorkoutPlan(userId, data);
    },
    ...commonMutationOptions,
  });

  const generateDiet = useMutation({
    mutationFn: (data: any) => {
      if (!userId) throw new Error("User not authenticated");
      return generateDietPlan(userId, data);
    },
    ...commonMutationOptions,
  });

  return {
    generateWorkout: generateWorkout.mutateAsync,
    generateDiet: generateDiet.mutateAsync,
    isGeneratingWorkout: generateWorkout.isPending,
    isGeneratingDiet: generateDiet.isPending,
    workoutError: generateWorkout.error,
    dietError: generateDiet.error,
  };
};