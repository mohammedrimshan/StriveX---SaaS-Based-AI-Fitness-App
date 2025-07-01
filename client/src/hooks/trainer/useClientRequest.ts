import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingClientRequests, acceptRejectClientRequest } from '@/services/trainer/trainerService'; 
import { PendingClientRequestsResponse, ClientRequestActionResponse } from '@/services/trainer/trainerService';
import { useToaster } from '../ui/useToaster';

export const useGetPendingClientRequests = (page: number = 1, limit: number = 10) => {
  return useQuery<PendingClientRequestsResponse, Error>({
    queryKey: ['pending-client-requests', page, limit],
    queryFn: () => getPendingClientRequests(page, limit),
    placeholderData: undefined,
    staleTime: 5000, 
  });
};

// ✅ Hook: Accept or Reject Client Request with Toasts
export const useAcceptRejectClientRequest = () => {
  const queryClient = useQueryClient();
  const { successToast, errorToast } = useToaster();
  return useMutation<
    ClientRequestActionResponse,
    Error,
    { clientId: string; action: 'accept' | 'reject'; rejectionReason?: string }
  >({
    mutationFn: ({ clientId, action, rejectionReason }) =>
      acceptRejectClientRequest(clientId, action, rejectionReason),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-client-requests'] });

      successToast(
        `Client request ${variables.action === 'accept' ? 'accepted' : 'rejected'} successfully!`
      );
    },

    onError: (error) => {
      errorToast(error.message || 'Failed to process the request.');
    },
  });
};
