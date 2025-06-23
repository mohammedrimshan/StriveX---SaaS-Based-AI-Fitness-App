import { useMutation } from "@tanstack/react-query";
import { cancelTrainerSlot } from "@/services/trainer/trainerService";
import { useToaster } from "../ui/useToaster";

export const useCancelTrainerSlot = () => {
  const { successToast, errorToast } = useToaster();
  return useMutation({
    mutationFn: cancelTrainerSlot,
    onSuccess: (data: any) => {
      successToast(data.message || "Slot cancelled successfully");
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || "Failed to cancel slot";
      errorToast(errMsg);
    },
  });
};
