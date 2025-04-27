
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { selectTrainerFromMatchedList } from "@/services/client/clientService";

export const useSelectTrainer = () => {
  return useMutation({
    mutationFn: (trainerId: string) => selectTrainerFromMatchedList(trainerId),
    onSuccess: (data) => {
      toast.success("Trainer selected successfully! Waiting for approval.");
      console.log("Trainer selection success:", data);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Trainer selection failed");
      console.error("Trainer selection error:", error);
    },
  });
};
