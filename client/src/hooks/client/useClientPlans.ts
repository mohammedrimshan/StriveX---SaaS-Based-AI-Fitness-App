// src/hooks/client/useClientPlans.ts
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getWorkoutPlans, getDietPlans } from '@/services/client/clientService';
import { IWorkoutPlan } from '@/types/Workout';
import { IDietPlan } from '@/types/Diet';
export const useWorkoutPlans = () => {
  const client = useSelector((state: RootState) => state.client.client);
  const userId = client?.clientId;

  return useQuery<IWorkoutPlan[], Error>({
    queryKey: ['workoutPlans', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID not available');
      return getWorkoutPlans(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDietPlans = () => {
  const client = useSelector((state: RootState) => state.client.client);
  const userId = client?.clientId;

  return useQuery<IDietPlan[], Error>({
    queryKey: ['dietPlans', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID not available');
      return getDietPlans(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};