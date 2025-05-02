import { ISlotEntity } from "../../models/slot.entity";

export interface ICreateSlotUseCase {
  execute(
    trainerId: string,
    slotData: {
      date: string;
      startTime: string;
      endTime: string;
    }
  ): Promise<ISlotEntity>;
}