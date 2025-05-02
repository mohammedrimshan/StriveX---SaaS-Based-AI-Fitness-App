import { useQuery } from '@tanstack/react-query';
import { getBookingDetials } from '@/services/client/clientService';

export const useUserBookings = () => {
  return useQuery({
    queryKey: ['userBookings'],
    queryFn: getBookingDetials,
  });
};