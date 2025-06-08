import mongoose, { model, Document, ObjectId } from "mongoose";
import { clientSchema } from "../schemas/client.schema";
import { IClientEntity } from "@/entities/models/client.entity";
export interface IClientModel extends Omit<IClientEntity, "id" | "membershipPlanId">, Document {

  _id: ObjectId;
  membershipPlanId:ObjectId;
  updateFCMToken(clientId: string, fcmToken: string): Promise<void>;
}

console.log("ClientModel loaded:", mongoose.models.Client);

export const ClientModel = mongoose.models.Client as mongoose.Model<IClientModel> ||
  model<IClientModel>("Client", clientSchema);
