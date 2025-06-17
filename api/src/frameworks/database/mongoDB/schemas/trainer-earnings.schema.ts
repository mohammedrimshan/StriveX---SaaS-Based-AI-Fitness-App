import { Schema } from "mongoose";
import { ITrainerEarningsEntity } from "@/entities/models/trainer-earnings.entity";

export const trainerEarningsSchema = new Schema<ITrainerEarningsEntity>(
  {
    slotId: { type: String, required: true },
    trainerId: { type: String, required: true },
    clientId: { type: String, required: true },
    membershipPlanId: { type: String, required: true },
    amount: { type: Number, required: true },
    trainerShare: { type: Number, required: true },
    adminShare: { type: Number, required: true },
    completedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

trainerEarningsSchema.index({ slotId: 1 }, { unique: true });
trainerEarningsSchema.index({ trainerId: 1, completedAt: 1 });