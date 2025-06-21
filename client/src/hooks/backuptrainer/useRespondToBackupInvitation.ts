
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { respondToBackupInvitation } from "@/services/backuptrainer/backupTrainerService";
import { RespondToInvitationPayload } from "@/types/backuptrainer";

export const useRespondToBackupInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RespondToInvitationPayload) =>
      respondToBackupInvitation(payload),
    onSuccess: () => {
      // Invalidate invitation list to refetch updated state
      queryClient.invalidateQueries({
        queryKey: ["trainer-backup-invitations"],
      });
    },
  });
};
