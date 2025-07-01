
import { useMutation } from "@tanstack/react-query";
import { createSlotsFromRule } from "@/services/trainer/trainerService";
import { RuleBasedSlotInput } from "@/types/Slot";
import { SlotsResponse } from "@/types/Slot";

export const useCreateSlotsFromRuleMutation = () => {
  return useMutation<SlotsResponse, Error, RuleBasedSlotInput>({
    mutationFn: createSlotsFromRule,
  });
};
