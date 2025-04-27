// D:\StriveX\client\src\hooks\client\useTrainerSelection.ts
import { useMutation } from "@tanstack/react-query";
import {
  saveTrainerSelectionPreferences,
  autoMatchTrainer,
  TrainerPreferencesData,
} from "@/services/client/clientService";
import { useToaster } from "@/hooks/ui/useToaster";

export const useSaveTrainerPreferences = () => {
  const { successToast, errorToast } = useToaster();
  return useMutation({
    mutationFn: (data: TrainerPreferencesData) =>
      saveTrainerSelectionPreferences(data),
    onSuccess: () => {
      successToast("Trainer preferences saved successfully");
    },
    onError: (error: any) => {
      errorToast(error.message || "Failed to save trainer preferences");
    },
  });
};

export const useAutoMatchTrainer = () => {
  const { successToast, errorToast } = useToaster();
  return useMutation({
    mutationFn: () => autoMatchTrainer(),
    onSuccess: () => {
      successToast("Trainer matched successfully");
    },
    onError: (error: any) => {
      errorToast(error.message || "Failed to auto-match trainer");
    },
  });
};

