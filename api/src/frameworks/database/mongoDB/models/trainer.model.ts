import { model, ObjectId } from "mongoose";
import { ITrainerEntity } from "../../../../entities/models/trainer.entity";
import { trainerSchema } from "../schemas/trainer.schema";

export interface ITrainerModel extends Omit<ITrainerEntity, "id">, Document {
	_id: ObjectId;
	updateFCMToken(clientId: string, fcmToken: string): Promise<void>;
}

export const TrainerModel = model<ITrainerModel>("Trainer", trainerSchema);