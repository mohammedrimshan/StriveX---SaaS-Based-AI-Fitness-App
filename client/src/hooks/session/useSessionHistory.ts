import { useQuery } from '@tanstack/react-query';
import { getSessionHistory, SessionHistoryResponse } from '@/services/SessionHistory/essionHistory';
import { UserRole } from '@/types/UserRole';
import toast from 'react-hot-toast';

interface UseSessionHistoryOptions {
  role: UserRole;
  page?: number;
  limit?: number;
}

export const useSessionHistory = ({ role, page = 1, limit = 10 }: UseSessionHistoryOptions) => {
  return useQuery<SessionHistoryResponse, Error>({
    queryKey: ['sessionHistory', role, page, limit],
    queryFn: async () => {
      try {
        const response = await getSessionHistory(role, page, limit);
        return response;
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch session history');
        throw error;
      }
    },
    placeholderData: () => undefined, 
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
