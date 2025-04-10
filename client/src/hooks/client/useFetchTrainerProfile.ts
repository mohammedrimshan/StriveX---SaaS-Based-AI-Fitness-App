// src/hooks/client/useFetchTrainerProfile.ts
import { useQuery } from "@tanstack/react-query";
import { TrainerProfile } from "@/types/trainer";
import { getTrainerProfile } from "@/services/client/clientService";

export const useFetchTrainerProfile = (trainerId: string | undefined) => {
  return useQuery<TrainerProfile>({
    queryKey: ["trainerProfile", trainerId],
    queryFn: async () => {
      if (!trainerId) throw new Error("Trainer ID is Required");
      const data = await getTrainerProfile(trainerId);
      console.log("QueryFn Returned Data:", data);
      return data;
    },
    enabled: !!trainerId,
    staleTime: 5 * 60 * 1000,
    onError: (err:any) => {
      console.error("useQuery Error:", err);
    },
  });
};