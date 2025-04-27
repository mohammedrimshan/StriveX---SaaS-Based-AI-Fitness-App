import { useMutation } from "@tanstack/react-query";
import { manualSelectTrainer, ManualSelectTrainerData } from "@/services/client/clientService";
import { useToaster } from "@/hooks/ui/useToaster";


export const useManualSelectTrainer = () => {
  const { successToast, errorToast } = useToaster();

  return useMutation({
    mutationFn: (data: ManualSelectTrainerData) => manualSelectTrainer(data),
    onSuccess: (response:any) => {
        console.log(response.message)
      if (response.success) {
        successToast("Trainer selected successfully");
      } else {
        errorToast(response.data.message || "Failed to select trainer");
      }
    },
    onError: (error: any) => {
      errorToast(error.response.data.message || "Failed to select trainer");
    },
  });
};