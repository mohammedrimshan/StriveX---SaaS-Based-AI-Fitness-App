import { ISlotEntity } from "@/entities/models/slot.entity";
import { SlotStatus, VideoCallStatus } from "@/shared/constants";
import { IBaseRepository } from "../base-repository.interface";
import { ClientInfoDTO } from "@/shared/dto/user.dto";

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
  findByRoomName(roomName: string): Promise<ISlotEntity | null>;
  updateVideoCallStatus(
    slotId: string,
    videoCallStatus: VideoCallStatus,
    videoCallRoomName?: string,
    jitsiJwt?: string ,
  ): Promise<ISlotEntity | null>;
  findSlotsWithClients(trainerId: string): Promise<(ISlotEntity & { client?: ClientInfoDTO; cancellationReason?: string })[]>
  endVideoCall(slotId: string): Promise<ISlotEntity | null>;
  getVideoCallDetails(slotId: string): Promise<{
    videoCallStatus: VideoCallStatus;
    videoCallRoomName?: string;
    videoCallJwt?: string;
  } | null>;
}
