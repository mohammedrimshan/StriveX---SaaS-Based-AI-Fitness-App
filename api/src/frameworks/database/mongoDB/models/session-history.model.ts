import { model, Schema } from "mongoose";
import { sessionHistorySchema } from "../schemas/session-history.schema";
import { ISlotEntity } from "@/entities/models/slot.entity";

export interface ISessionHistoryModel extends Omit<ISlotEntity, "id" | "isBooked" | "isAvailable" | "expiresAt" | "videoCallRoomName" | "videoCallJwt">, Document {
  _id: Schema.Types.ObjectId;
}

export const SessionHistoryModel = model<ISessionHistoryModel>("SessionHistory", sessionHistorySchema);