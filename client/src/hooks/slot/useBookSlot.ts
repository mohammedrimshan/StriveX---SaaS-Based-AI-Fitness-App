import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookSlot } from '@/services/client/clientService';

export const useBookSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookSlot,
    onSuccess: () => {
      // Refetch slots after booking
      queryClient.invalidateQueries({ queryKey: ['trainerSlots'] });
    },
  });
};
