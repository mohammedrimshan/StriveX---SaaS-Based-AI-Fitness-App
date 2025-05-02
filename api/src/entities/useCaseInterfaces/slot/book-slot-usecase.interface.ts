import { ISlotEntity } from "../../models/slot.entity";

export interface IBookSlotUseCase {
  execute(clientId: string, slotId: string): Promise<ISlotEntity>;
}