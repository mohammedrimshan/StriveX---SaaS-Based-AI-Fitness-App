// src/hooks/client/usePlanMutations.ts
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { generateWorkoutPlan, generateDietPlan } from '@/services/client/clientService';
import axios from 'axios';

export const usePlanMutations = () => {
  const client = useSelector((state: RootState) => state.client.client);
  const queryClient = useQueryClient();
  const userId = client?.clientId; 
  console.log(userId,"usrrr")
  const commonMutationOptions = {
    onError: (error: unknown) => {
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Mutation failed:", errorMessage, error);
      throw new Error(errorMessage);
    },
  };

  const generateWorkout = useMutation({
    mutationFn: (data: any) => {
      if (!userId) throw new Error("User not authenticated");
      console.log("Generating workout plan for userId:", userId);
      return generateWorkoutPlan(userId, data);
    },
    onSuccess: (response) => {
      console.log("Workout plan generated successfully:", response);
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', userId] });
      queryClient.refetchQueries({ queryKey: ['workoutPlans', userId] });
    },
    ...commonMutationOptions,
  });

  const generateDiet = useMutation({
    mutationFn: (data: any) => {
      if (!userId) throw new Error("User not authenticated");
      console.log("Generating diet plan for userId:", userId);
      return generateDietPlan(userId, data);
    },
    onSuccess: (response) => {
      console.log("Diet plan generated successfully:", response);
      queryClient.invalidateQueries({ queryKey: ['dietPlans', userId] });
      queryClient.refetchQueries({ queryKey: ['dietPlans', userId] });
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