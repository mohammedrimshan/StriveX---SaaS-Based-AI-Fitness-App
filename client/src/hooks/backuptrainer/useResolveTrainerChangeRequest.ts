
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveTrainerChangeRequest } from "@/services/backuptrainer/backupTrainerService";
import { useToaster } from "@/hooks/ui/useToaster";

export const useResolveTrainerChangeRequest = () => {
  const queryClient = useQueryClient();
  const { successToast, errorToast } = useToaster();

  return useMutation({
    mutationFn: resolveTrainerChangeRequest,
    onSuccess: (data) => {
      successToast(data.message || "Trainer change request resolved.");
      queryClient.invalidateQueries({ queryKey: ["admin-trainer-change-requests"] }); // Adjust key as needed
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || "Failed to resolve request";
      errorToast(message);
    },
  });
};
