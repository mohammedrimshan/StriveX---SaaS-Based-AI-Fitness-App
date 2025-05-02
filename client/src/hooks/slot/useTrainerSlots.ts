import { useQuery } from '@tanstack/react-query';
import { getTrainerSlots } from '@/services/client/clientService';

export const useTrainerSlots = () => {
  return useQuery({
    queryKey: ['trainerSlots'],
    queryFn: getTrainerSlots,
  });
};
