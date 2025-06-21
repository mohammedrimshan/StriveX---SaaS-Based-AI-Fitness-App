import { ISlotEntity } from "../../models/slot.entity";

export interface IReassignTrainerUseCase {
  execute(slotId: string, reason: string): Promise<ISlotEntity>;
}