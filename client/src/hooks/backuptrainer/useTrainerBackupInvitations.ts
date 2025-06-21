
import { useQuery } from "@tanstack/react-query";
import { getTrainerBackupInvitations } from "@/services/backuptrainer/backupTrainerService";

export const useTrainerBackupInvitations = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["trainer-backup-invitations", page],
    queryFn: () => getTrainerBackupInvitations(page, limit),
    //@ts-ignore
    keepPreviousData: true,
  });
};
