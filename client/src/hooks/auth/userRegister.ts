import { signup } from "@/services/auth/authService";
import { useMutation } from "@tanstack/react-query";
import { IAuthResponse } from "@/types/Response"; 
import { UserDTO } from "@/types/User";

export const useRegisterMutation = () => {
  return useMutation<IAuthResponse, Error, UserDTO>({
    mutationFn: signup,
  });
};
