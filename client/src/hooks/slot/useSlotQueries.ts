import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { createSlot,getTrainerOwnSlots } from '@/services/trainer/trainerService';
import { SlotsResponse, CreateSlotData } from '@/types/Slot';



// Trainer: Create a slot
export const useCreateSlot = () => {
  const queryClient = useQueryClient();
  return useMutation<SlotsResponse, Error, CreateSlotData>({
    mutationFn: createSlot,
    onSuccess: () => {
      // Invalidate trainer's own slots query
      queryClient.invalidateQueries({ queryKey: ['trainerOwnSlots'] });
    },
  });
};

// Trainer: Get own slots
export const useTrainerOwnSlots = () => {
  return useQuery<SlotsResponse, Error>({
    queryKey: ['trainerOwnSlots'],
    queryFn: getTrainerOwnSlots,
  });
};