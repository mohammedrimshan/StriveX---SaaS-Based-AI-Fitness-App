// queries/trainerClientRequests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingClientRequests, acceptRejectClientRequest } from '@/services/trainer/trainerService'; 
import { PendingClientRequestsResponse, ClientRequestActionResponse } from  '@/services/trainer/trainerService';


export const useGetPendingClientRequests = (page: number = 1, limit: number = 10) => {
    return useQuery<PendingClientRequestsResponse, Error>({
      queryKey: ['pending-client-requests', page, limit],
      queryFn: () => getPendingClientRequests(page, limit),
      placeholderData: undefined,
      staleTime: 5000, 
    });
  };
  
  // Hook: Accept or Reject Client Request
  export const useAcceptRejectClientRequest = () => {
    const queryClient = useQueryClient();
  
    return useMutation<
      ClientRequestActionResponse, 
      Error,                       
      { clientId: string; action: 'accept' | 'reject'; rejectionReason?: string } 
    >({
      mutationFn: ({ clientId, action, rejectionReason }) =>
        acceptRejectClientRequest(clientId, action, rejectionReason),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pending-client-requests'] });
      },
    });
  };