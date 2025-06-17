// File: src/hooks/trainer/useTrainerBookedAndCancelledSlots.ts
import { useQuery } from "@tanstack/react-query";
import { getTrainerBookedAndCancelledSlots } from "@/services/trainer/trainerService";
import { SlotsResponse } from "@/types/Slot";

interface UseTrainerBookedAndCancelledSlotsProps {
  trainerId: string;
  date?: string;
  page?: number;
  limit?: number;
}
export const useTrainerBookedAndCancelledSlots = ({
  trainerId,
  date,
  page = 1,
  limit = 20,
}: UseTrainerBookedAndCancelledSlotsProps) => {
  return useQuery<SlotsResponse, Error>({
    queryKey: ["trainerBookedAndCancelledSlots", trainerId, date || "all", page, limit],
    queryFn: () =>
      getTrainerBookedAndCancelledSlots({ trainerId, date, page, limit }),
    enabled: !!trainerId && (!date || !isNaN(new Date(date).getTime())),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // or cacheTime if using React Query <v5
    retry: 1,
  });
};
