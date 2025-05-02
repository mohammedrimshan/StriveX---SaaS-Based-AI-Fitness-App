import { ISlotEntity } from "../../models/slot.entity";

export interface IGetTrainerSlotsUseCase {
  execute(
    trainerId: string,
    startTime?: Date,
    endTime?: Date,
    role?: "trainer" | "client"
  ): Promise<
    Array<
      Omit<ISlotEntity, "id" | "startTime" | "endTime"> & {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        isBooked: boolean;
        isAvailable: boolean;
      }
    >
  >;
}