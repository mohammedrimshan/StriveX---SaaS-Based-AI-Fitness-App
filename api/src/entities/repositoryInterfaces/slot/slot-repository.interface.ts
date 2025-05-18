import { ISlotEntity } from "@/entities/models/slot.entity";
import { SlotStatus } from "@/shared/constants";
import { IBaseRepository } from "../base-repository.interface";

export interface ISlotRepository extends IBaseRepository<ISlotEntity> {
  findByTrainerId(
    trainerId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<ISlotEntity[]>;
  findOverlappingSlots(
    trainerId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ISlotEntity[]>;
  updateStatus(
    slotId: string,
    status: SlotStatus,
    clientId?: string,
    isBooked?: boolean,
    cancellationReason?: string
  ): Promise<ISlotEntity | null>;
  findBookedSlotByClientId(
    clientId: string,
    slotId: string
  ): Promise<ISlotEntity | null>;
  findAnyBookedSlotByClientId(clientId: string): Promise<ISlotEntity | null>;
  getSlotsWithStatus(
    trainerId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<
    Array<
      Omit<ISlotEntity, "id" | "startTime" | "endTime"> & {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        isBooked: boolean;
        isAvailable: boolean;
        cancellationReason?: string;
      }
    >
  >;

  findTrainerSlotsByClientId(userClientId: string): Promise<ISlotEntity[]>;
  findBookedSlotsByClientId(clientId: string): Promise<ISlotEntity[]>;
}
