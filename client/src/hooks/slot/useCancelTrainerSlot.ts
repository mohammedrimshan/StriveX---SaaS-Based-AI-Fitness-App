
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelTrainerSlot } from "@/services/trainer/trainerService";
import { useToaster } from "../ui/useToaster";

export const useCancelTrainerSlot = () => {
  const { successToast, errorToast } = useToaster();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelTrainerSlot,
    onSuccess: (data: any) => {
      successToast(data.message || "Slot cancelled successfully");
      // Invalidate the slots query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ["trainerBookedAndCancelledSlots"],
      });
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || "Failed to cancel slot";
      errorToast(errMsg);
    },
  });
};