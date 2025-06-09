import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { TrainerProfileType } from "@/types/trainer";
import { getTrainerProfile } from "@/services/client/clientService";

export const useFetchTrainerProfile = (
  trainerId?: string,
  clientId?: string
): UseQueryResult<TrainerProfileType | null, Error> => {
  const isEnabled = Boolean(trainerId && trainerId.trim());

  return useQuery<TrainerProfileType | null, Error>({
    queryKey: ["trainerProfile", trainerId, clientId],
    queryFn: async () => {
      if (!trainerId) throw new Error("Trainer ID is required");
      const data = await getTrainerProfile(trainerId, clientId ?? "");
      return Object.keys(data ?? {}).length ? data : null;
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
