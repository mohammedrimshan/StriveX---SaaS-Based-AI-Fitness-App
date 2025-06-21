
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitTrainerChangeRequest } from "@/services/backuptrainer/backupTrainerService";
import { SubmitTrainerChangeRequestPayload, TrainerChangeRequestResponse } from "@/types/backuptrainer";

export const useSubmitTrainerChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<TrainerChangeRequestResponse, Error, SubmitTrainerChangeRequestPayload>({
    mutationFn: submitTrainerChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-trainer-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["client-backup-invitations"] });
    },
  });
};