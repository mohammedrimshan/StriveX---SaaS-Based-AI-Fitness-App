import { MutationFunction, useMutation } from "@tanstack/react-query";
import { UserDTO } from '@/types/User';
import { IAuthResponse } from "@/types/Response";

export const usePostRegistration = (
  mutationFn: MutationFunction<IAuthResponse, UserDTO>
) => {
  return useMutation<IAuthResponse, unknown, UserDTO>({
    mutationFn
  });
};