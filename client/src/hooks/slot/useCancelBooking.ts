import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '@/services/client/clientService';

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      // Invalidate both trainer slots and user bookings queries
      queryClient.invalidateQueries({ queryKey: ['trainerSlots'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
};