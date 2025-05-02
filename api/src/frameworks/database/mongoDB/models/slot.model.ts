import { model, Schema } from "mongoose";
import { slotSchema } from "../schemas/slot.schema";
import { ISlotEntity } from "@/entities/models/slot.entity";

export interface ISlotModel extends Omit<ISlotEntity, "id">, Document {
  _id: Schema.Types.ObjectId;
}

export const SlotModel = model<ISlotModel>("Slot", slotSchema);