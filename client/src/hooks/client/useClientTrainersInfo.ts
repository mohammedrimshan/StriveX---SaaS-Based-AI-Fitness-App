
import { useQuery } from "@tanstack/react-query";
import { getClientTrainersInfo } from "@/services/client/clientService";

export const useClientTrainersInfo = () => {
  return useQuery({
    queryKey: ["client-trainers-info"],
    queryFn: getClientTrainersInfo,
    staleTime: 1000 * 60 * 5, 
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
