import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientProfile } from "./clientService";
import { IAuthResponse } from "@/types/Response";
import { IClient } from "@/types/User";
import { useDispatch } from "react-redux";
import { clientLogin } from "@/store/slices/client.slice";
export const useUpdateClientProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<IAuthResponse, Error, Partial<IClient>>({
    mutationFn: updateClientProfile,
    onSuccess: (data) => {
     
      const updatedClient = data.user; 
      console.log(updatedClient)
      if (updatedClient) {
        dispatch(clientLogin(updatedClient));
      }
      queryClient.invalidateQueries({ queryKey: ["clientProfile"] });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });
};