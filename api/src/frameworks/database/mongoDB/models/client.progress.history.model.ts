import { IClientProgressHistoryEntity } from "@/entities/models/clientprogresshistory.model";
import { Schema, model, Document, Types } from "mongoose";
import { ClientProgressHistorySchema } from "../schemas/client.history.schema";
export interface IClientProgressHistoryModel extends Omit<IClientProgressHistoryEntity, "userId">, Document{
  userId: Types.ObjectId;
}

export const ClientProgressHistoryModel = model<IClientProgressHistoryModel>("ClientProgressHistory", ClientProgressHistorySchema);