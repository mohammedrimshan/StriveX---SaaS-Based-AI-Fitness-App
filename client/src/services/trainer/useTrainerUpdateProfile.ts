// src\hooks\useUpdateTrainerProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTrainerProfile } from "./trainerService";
import { ITrainer } from "@/types/User";
import { useDispatch } from "react-redux";
import { trainerLogin } from "@/store/slices/trainer.slice"; // Assuming you have this action

export const useUpdateTrainerProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<
    { success: boolean; message: string; trainer: ITrainer }, // Response type
    Error, // Error type
    { trainerId: string; profileData: Partial<ITrainer> } // Variables type
  >({
    mutationFn: ({ trainerId, profileData }) => updateTrainerProfile(trainerId, profileData),
    onSuccess: (data) => {
      const updatedTrainer = data.trainer;
      if (updatedTrainer) {
        dispatch(trainerLogin(updatedTrainer)); // Update Redux store
      }
      queryClient.invalidateQueries({ queryKey: ["trainerProfile"] }); // Invalidate cache
    },
    onError: (error) => {
      console.error("Trainer profile update failed:", error);
    },
  });
};