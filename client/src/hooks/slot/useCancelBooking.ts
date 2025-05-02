import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '@/services/client/clientService';

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      // Refetch slots after cancelling
      queryClient.invalidateQueries({ queryKey: ['trainerSlots'] });
    },
  });
};
