import { ISlotEntity } from "@/entities/models/slot.entity";
export interface IGetUserBookingsUseCase {
    execute(userClientId: string): Promise<ISlotEntity[]>;
  }