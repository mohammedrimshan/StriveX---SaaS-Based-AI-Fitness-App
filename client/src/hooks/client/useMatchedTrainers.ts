import { useQuery } from "@tanstack/react-query";
import { getMatchedTrainers, MatchedTrainersResponse } from "@/services/client/clientService";
import { useToaster } from "@/hooks/ui/useToaster";

export const useMatchedTrainers = () => {
  const { errorToast } = useToaster();

  return useQuery<MatchedTrainersResponse, Error>({
    queryKey: ["matchedTrainers"],
    queryFn: () => getMatchedTrainers(),
    retry: false,
    // @ts-ignore - Ignore type conflict for onError
    onError: (error: Error) => {
      errorToast(error.message || "Failed to fetch matched trainers");
    },
  });
};