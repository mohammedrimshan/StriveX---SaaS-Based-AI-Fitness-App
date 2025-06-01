import { Schema, model, Document } from "mongoose";
import { ICancellationEntity } from "@/entities/models/cancellation.entity";
import { cancellationSchema } from "../schemas/cancellation.schema";
export interface ICancellationModel extends Omit<ICancellationEntity, "id">, Document {
  _id: Schema.Types.ObjectId;
}

export const CancellationModel = model<ICancellationModel>("Cancellation", cancellationSchema);