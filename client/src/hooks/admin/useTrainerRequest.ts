
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTrainerRequests,
  updateTrainerRequest,
  UpdateTrainerRequestData,
  TrainerRequestsPaginatedResponse,
} from "@/services/admin/adminService";
import { useToaster } from "@/hooks/ui/useToaster";

export const useTrainerRequests = (
  page: number,
  limit: number,
  search: string
) => {
  const { errorToast } = useToaster();

  return useQuery<TrainerRequestsPaginatedResponse, Error>({
    queryKey: ["trainerRequests", page, limit, search] as const,
    queryFn: () => getTrainerRequests({ page, limit, search }),
    staleTime: 5 * 60 * 1000,
    retry: false, 
    // @ts-ignore - Ignore type conflict for onError
    onError: (error: Error) => {
      errorToast(error.message || "Failed to fetch trainer requests");
    },
  });
};

export const useUpdateTrainerRequest = () => {
  const { successToast, errorToast } = useToaster();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTrainerRequestData) => updateTrainerRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainerRequests"] });
      successToast("Trainer request updated successfully");
    },
    onError: (error: Error) => {
      errorToast(error.message || "Failed to update trainer request");
    },
  });
};
