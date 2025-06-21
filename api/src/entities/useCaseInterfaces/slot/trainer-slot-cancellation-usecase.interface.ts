import { ISlotEntity } from "../../models/slot.entity";

export interface ITrainerSlotCancellationUseCase {
  execute(
    trainerId: string,
    slotId: string,
    cancellationReason: string
  ): Promise<ISlotEntity>;
}
