import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getTrainerClients } from "@/services/trainer/trainerService";
import { useToaster } from "@/hooks/ui/useToaster";



export const useTrainerClients = (page: number = 1, limit: number = 10): UseQueryResult<{ clients: any[]; totalPages: number; currentPage: number; totalClients: number }> => {
  const { errorToast } = useToaster();
  return useQuery({
    queryKey: ["trainerClients", page, limit],
    queryFn: () => getTrainerClients(page, limit),
    staleTime: 5 * 60 * 1000,
    retry: false,
    // @ts-ignore - Ignore type conflict for onError
    onError: (error: any) => {
      errorToast(error.message || "Failed to fetch trainer clients");
    },
  });
};