import { useQuery } from "@tanstack/react-query";
import { getTrainerBackupClients } from "@/services/backuptrainer/backupTrainerService";

export const useTrainerBackupClients = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["trainer-backup-clients", page, limit],
    queryFn: () => getTrainerBackupClients(page, limit),
  });
};