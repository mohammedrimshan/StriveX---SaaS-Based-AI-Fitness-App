import { ISlotEntity } from "../../models/slot.entity";

export interface ICancelBookingUseCase {
  execute(clientId: string, slotId: string,cancellationReason?:string): Promise<ISlotEntity>;
}