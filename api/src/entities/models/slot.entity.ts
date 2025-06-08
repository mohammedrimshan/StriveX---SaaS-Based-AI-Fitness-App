import { SlotStatus, VideoCallStatus } from "@/shared/constants";
import { Types } from "mongoose";
export interface ISlotEntity {
  id?: string;
  trainerId: Types.ObjectId | string;
  trainerName: string;
  clientName?: string;
  clientId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  isBooked: boolean;
  isAvailable: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  bookedAt: Date;
  cancellationReason?: string;
  videoCallRoomName?: string;
  videoCallJwt?: string;
  videoCallStatus?: VideoCallStatus;
}
