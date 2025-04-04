import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordProgress } from "@/services/client/clientService";
import { IProgressEntity } from "@/types/Progress";

export const useRecordProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<IProgressEntity, Error, Omit<IProgressEntity, "_id">>({
    mutationFn: (progressData) => recordProgress(progressData),
    onSuccess: (data) => {
      // Invalidate and refetch user progress after recording
      queryClient.invalidateQueries({ queryKey: ["userProgress", data.clientId] });
    },
  });
};