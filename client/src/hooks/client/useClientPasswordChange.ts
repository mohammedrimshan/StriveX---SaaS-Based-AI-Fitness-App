import { IAxiosResponse } from "@/types/Response";
import { updateClientPassword } from "@/services/client/clientService";
import { useMutation } from "@tanstack/react-query";

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const useClientPasswordUpdateMutation = () => {
  return useMutation<IAxiosResponse, Error, UpdatePasswordData>({
    mutationFn: updateClientPassword,
  });
};
