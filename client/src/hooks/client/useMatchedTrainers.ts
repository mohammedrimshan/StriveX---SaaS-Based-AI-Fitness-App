// src/hooks/client/useMatchedTrainers.ts
import { useQuery } from "@tanstack/react-query";
import { getMatchedTrainers } from "@/services/client/clientService";
import { useToaster } from "@/hooks/ui/useToaster";

export const useMatchedTrainers = () => {
  const { errorToast } = useToaster();
  
  return useQuery({
    queryKey: ["matchedTrainers"],
    queryFn: () => getMatchedTrainers(),
    retry: false, 
    // @ts-ignore - Ignore type conflict for onError
    onError: (error: any) => {
      errorToast(error.message || "Failed to fetch matched trainers");
    },
  });
};