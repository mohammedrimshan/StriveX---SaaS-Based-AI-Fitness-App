import { ISlotEntity } from "@/entities/models/slot.entity";

export interface IToggleSlotAvailabilityUseCase {
  execute(trainerId: string, slotId: string): Promise<ISlotEntity>;
}
