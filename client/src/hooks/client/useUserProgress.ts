import { useQuery } from "@tanstack/react-query";
import { getUserProgress } from "@/services/client/clientService";
import { IProgressEntity } from "@/types/Progress";

export const useUserProgress = (userId: string) => {
  return useQuery<IProgressEntity[], Error>({
    queryKey: ["userProgress", userId],
    queryFn: () => getUserProgress(userId),
    enabled: !!userId, 
  });
};