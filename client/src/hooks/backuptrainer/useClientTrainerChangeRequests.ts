
import { useQuery } from "@tanstack/react-query";
import { getClientTrainerChangeRequests } from "@/services/backuptrainer/backupTrainerService";

export const useClientTrainerChangeRequests = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ["client-trainer-change-requests", page, limit],
    queryFn: () => getClientTrainerChangeRequests(page, limit),
    //@ts-ignore
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
  });
};
