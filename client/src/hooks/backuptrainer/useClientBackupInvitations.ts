
import { useQuery } from "@tanstack/react-query";
import { getClientBackupInvitations } from "@/services/backuptrainer/backupTrainerService";

export const useClientBackupInvitations = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ["client-backup-invitations", page, limit],
    queryFn: () => getClientBackupInvitations(page, limit),
    //@ts-ignore
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
  });
};
