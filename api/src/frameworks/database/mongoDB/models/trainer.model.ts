import mongoose, { model, ObjectId } from "mongoose";
import { ITrainerEntity } from "../../../../entities/models/trainer.entity";
import { trainerSchema } from "../schemas/trainer.schema";

export interface ITrainerModel extends Omit<ITrainerEntity, "id">, Document {
	_id: ObjectId;
	updateFCMToken(clientId: string, fcmToken: string): Promise<void>;
}

console.log("TrainerModel loaded:", mongoose.models.Trainer);
export const TrainerModel =
  (mongoose.models.Trainer as mongoose.Model<ITrainerModel>) ||
  model<ITrainerModel>("Trainer", trainerSchema);