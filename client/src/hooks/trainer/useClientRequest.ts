import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingClientRequests, acceptRejectClientRequest } from '@/services/trainer/trainerService';
import { PendingClientRequestsResponse, ClientRequestActionResponse } from '@/services/trainer/trainerService';

export const useGetPendingClientRequests = (page: number = 1, limit: number = 10) => {
  return useQuery<PendingClientRequestsResponse, Error>({
    queryKey: ['pending-client-requests', page, limit],
    queryFn: () => getPendingClientRequests(page, limit),
    placeholderData: undefined,
    staleTime: 5000,
  });
};

export const useAcceptRejectClientRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ClientRequestActionResponse,
    Error,
    { clientId: string; action: 'accept' | 'reject'; rejectionReason?: string },
    { previousData?: PendingClientRequestsResponse } // 🛠️ Context type here
  >({
    mutationFn: ({ clientId, action, rejectionReason }) =>
      acceptRejectClientRequest(clientId, action, rejectionReason),

    onMutate: async ({ clientId }) => {
      await queryClient.cancelQueries({ queryKey: ['pending-client-requests'] });

      const previousData = queryClient.getQueryData<PendingClientRequestsResponse>([
        'pending-client-requests',
      ]);

      queryClient.setQueryData<PendingClientRequestsResponse>(
        ['pending-client-requests'],
        (old) => {
          if (!old || !old.requests) return old;
          return {
            ...old,
            requests: old.requests.filter((request) => request.clientId !== clientId),
          };
        }
      );

      return { previousData }; // Return context
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['pending-client-requests'], context.previousData);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-client-requests'] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-client-requests'] });
    },
  });
};
