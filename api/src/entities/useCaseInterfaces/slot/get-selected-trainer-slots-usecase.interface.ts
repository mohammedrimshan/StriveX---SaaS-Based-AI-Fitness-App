import { ISlotEntity } from "@/entities/models/slot.entity";

export interface IGetSelectedTrainerSlotsUseCase {
  execute(userClientId: string): Promise<ISlotEntity[]>;
}
