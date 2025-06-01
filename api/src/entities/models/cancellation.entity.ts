import { Types } from "mongoose";

export interface ICancellationEntity {
  id?: string;
  slotId: Types.ObjectId | string;
  clientId:  Types.ObjectId | string;
  trainerId: Types.ObjectId | string;
  cancellationReason: string;
  cancelledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}