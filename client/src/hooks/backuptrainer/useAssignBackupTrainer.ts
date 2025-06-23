import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignBackupTrainer } from "@/services/backuptrainer/backupTrainerService";
import { useToaster } from "@/hooks/ui/useToaster";
import { AssignBackupTrainerResponse } from "@/types/backuptrainer";

export const useAssignBackupTrainer = () => {
  const queryClient = useQueryClient();
  const { successToast, errorToast } = useToaster();

  return useMutation<AssignBackupTrainerResponse, Error, void>({
    mutationFn: assignBackupTrainer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clientProfile"] });
      successToast(data.message || "Backup trainer assigned successfully");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Something went wrong";
      errorToast(msg);
    },
  });
};
