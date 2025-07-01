
import { useMutation } from "@tanstack/react-query";
import { useToaster } from "../ui/useToaster";
import { selectTrainerFromMatchedList } from "@/services/client/clientService";

export const useSelectTrainer = () => {
  const { successToast, errorToast } = useToaster();

  return useMutation({
    mutationFn: (trainerId: string) => selectTrainerFromMatchedList(trainerId),
    onSuccess: (data) => {
      successToast("Trainer selected successfully! Waiting for approval.");
      console.log("Trainer selection success:", data);
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Trainer selection failed");
      console.error("Trainer selection error:", error);
    },
  });
};
