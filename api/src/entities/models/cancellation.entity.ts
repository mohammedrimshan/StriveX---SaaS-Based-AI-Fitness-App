import { Types } from "mongoose";

export interface ICancellationEntity {
  id?: string;
  slotId: Types.ObjectId | string;
  clientId:  Types.ObjectId | string;
  trainerId: Types.ObjectId | string;
  cancellationReason: string;
   cancelledBy: "trainer" | "client"; 
  cancelledAt: Date;
}