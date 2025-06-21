import { model, Document } from "mongoose";
import { TrainerChangeRequestSchema } from "../schemas/trainerchangerequest.schema";
import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";

export interface ITrainerChangeRequestModel extends ITrainerChangeRequestEntity, Document {
  _id: string;
}

export const TrainerChangeRequestModel = model<ITrainerChangeRequestModel>(
  "TrainerChangeRequest",
  TrainerChangeRequestSchema
);
