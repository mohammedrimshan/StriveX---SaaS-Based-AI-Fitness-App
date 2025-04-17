import { Schema } from "mongoose";
import { IMembershipPlanEntity } from "@/entities/models/membership-plan.entity";

export const membershipPlanSchema = new Schema<IMembershipPlanEntity>(
  {
    name: { type: String, required: true },
    durationMonths: { type: Number, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);