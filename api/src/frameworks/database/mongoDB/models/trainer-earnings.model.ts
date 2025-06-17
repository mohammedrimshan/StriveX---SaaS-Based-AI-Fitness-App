import { model } from "mongoose";
import { ITrainerEarningsEntity } from "@/entities/models/trainer-earnings.entity";
import { trainerEarningsSchema } from "../schemas/trainer-earnings.schema";

export const TrainerEarningsModel = model<ITrainerEarningsEntity>(
  "TrainerEarnings",
  trainerEarningsSchema
);
