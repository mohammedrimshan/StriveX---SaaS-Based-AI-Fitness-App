import { IAxiosResponse } from "@/types/Response";
import { useMutation } from "@tanstack/react-query";
import { updateTrainerPassword } from "@/services/trainer/trainerService";
export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const useTrainerPasswordUpdateMutation = () => {
  return useMutation<IAxiosResponse, Error, UpdatePasswordData>({
    mutationFn: updateTrainerPassword,
  });
};
