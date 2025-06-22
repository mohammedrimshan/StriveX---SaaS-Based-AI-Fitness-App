
import { useQuery } from "@tanstack/react-query";
import { getAllTrainerChangeRequests } from "@/services/backuptrainer/backupTrainerService";

export interface Params {
  page?: number;
  limit?: number;
  status?: string;
}

export const useAllTrainerChangeRequests = ({ page = 1, limit = 10, status }: Params) => {
  return useQuery({
    queryKey: ["admin-trainer-change-requests", page, limit, status],
    queryFn: () => getAllTrainerChangeRequests({ page, limit, status }),
  });
};
