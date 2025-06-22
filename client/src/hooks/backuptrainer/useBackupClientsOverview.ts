import { useQuery } from "@tanstack/react-query";
import { getBackupClientsOverview } from "@/services/backuptrainer/backupTrainerService";
import { BackupClientsOverviewResponse } from "@/types/backuptrainer";

interface Params {
  page?: number;
  limit?: number;
}

export const useBackupClientsOverview = ({ page = 1, limit = 10 }: Params) => {
  return useQuery<BackupClientsOverviewResponse>({
    queryKey: ["admin-backup-clients-overview", page, limit],
    queryFn: () => getBackupClientsOverview({ page, limit }),
    staleTime: 1000 * 60 * 3,
  });
};
