import { RuleBasedSlotInput } from "@/entities/models/rulebasedslot.entity";
import { ISlotEntity } from "@/entities/models/slot.entity";

export interface ICreateSlotsFromRuleUseCase {
  execute(input: RuleBasedSlotInput): Promise<ISlotEntity[]>;
}
