import { Schema } from "mongoose";
import { ITrainerChangeRequestModel } from "../models/trainerchangerequest.model";
import { TrainerChangeRequestStatus } from "@/shared/constants";

export const TrainerChangeRequestSchema = new Schema<ITrainerChangeRequestModel>({
  clientId: { type: String, required: true, index: true },
  backupTrainerId: { type: String, required: true },
  requestType: { type: String, enum: ["CHANGE", "REVOKE"], required: true },
  reason: { type: String, required: true},
  status: {
    type: String,
    enum: Object.values(TrainerChangeRequestStatus),
    default: TrainerChangeRequestStatus.PENDING,
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, required: false },
  resolvedBy: { type: String, required: false },
});

TrainerChangeRequestSchema.index({ clientId: 1, status: 1 });
