import { Document,ObjectId, model } from "mongoose";
import { IClientEntity } from "@/entities/models/client.entity";
import { clientSchema } from "../schemas/client.schema";
export interface IClientModel extends Omit<IClientEntity, "id">, Document {
  _id: ObjectId;
  updateFCMToken(clientId: string, fcmToken: string): Promise<void>;
}

export const ClientModel = model<IClientModel>("Client", clientSchema);