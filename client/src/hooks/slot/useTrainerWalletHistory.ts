import { useQuery } from "@tanstack/react-query";
import { getTrainerWalletHistory,  } from "@/services/trainer/trainerService";
import { WalletHistoryResponse } from "@/types/wallet";

interface UseTrainerWalletHistoryProps {
  page?: number;
  limit?: number;
  status?: string;
}

export const useTrainerWalletHistory = ({ page = 1, limit = 10, status }: UseTrainerWalletHistoryProps) => {
  return useQuery<WalletHistoryResponse, Error>({
    queryKey: ["trainerWalletHistory", page, limit, status],
    queryFn: () => getTrainerWalletHistory(page, limit, status),
    placeholderData: (prevData) => prevData, 
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
