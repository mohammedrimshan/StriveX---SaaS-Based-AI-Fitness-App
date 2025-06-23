import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
  checkWalletBalance,
  CheckoutSessionResponse,
} from "@/services/client/clientService";

export const useWalletBalance = (): UseMutationResult<CheckoutSessionResponse, Error, void> => {
  return useMutation({
    mutationFn: () => checkWalletBalance(),
    onError: (error: Error) => {
      console.error("Wallet balance check error:", error.message);
    },
    onSuccess: (data: CheckoutSessionResponse) => {
      console.log("Wallet balance checked successfully:", data);
    },
  });
};

