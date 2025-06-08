
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { upgradeSubscription, CreateCheckoutSessionData, CheckoutSessionResponse } from "@/services/client/clientService";

export const useUpgradeSubscription = (): UseMutationResult<
  CheckoutSessionResponse,
  Error,
  CreateCheckoutSessionData
> => {
  return useMutation({
    mutationFn: (data: CreateCheckoutSessionData) => upgradeSubscription(data),
    onError: (error: Error) => {
      console.error("Upgrade subscription session creation error:", error.message);
    },
    onSuccess: (data: CheckoutSessionResponse) => {
      console.log("Upgrade subscription session created successfully:", data.url);
    },
  });
};