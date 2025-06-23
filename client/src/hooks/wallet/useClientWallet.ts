import { getClientWalletDetails } from "@/services/client/clientService";
import { useQuery } from "@tanstack/react-query";
export const useClientWallet = (year: number, month: number, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["client-wallet", year, month, page, limit],
    queryFn: () => getClientWalletDetails
    (year, month, page, limit),
    enabled: !!year && !!month,
  });
};