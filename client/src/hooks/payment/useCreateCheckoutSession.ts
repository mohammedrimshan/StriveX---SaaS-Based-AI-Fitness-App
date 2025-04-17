import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
  createCheckoutSession,
  CreateCheckoutSessionData,
  CheckoutSessionResponse,
} from "@/services/client/clientService"; 

export const useCreateCheckoutSession = (): UseMutationResult<
  CheckoutSessionResponse,
  Error,
  CreateCheckoutSessionData
> => {
  return useMutation({
    mutationFn: (data: CreateCheckoutSessionData) => createCheckoutSession(data),
    onError: (error: Error) => {
      console.error("Checkout session creation error:", error.message);
    },
    onSuccess: (data: CheckoutSessionResponse) => {
      console.log("Checkout session created successfully:", data.url);
    },
  });
};