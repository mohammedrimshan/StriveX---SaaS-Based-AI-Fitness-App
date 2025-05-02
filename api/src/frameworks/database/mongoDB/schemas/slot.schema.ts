import { Schema,Types } from "mongoose";
import { ISlotModel } from "../models/slot.model";
import { SlotStatus } from "@/shared/constants";

export const slotSchema = new Schema<ISlotModel>(
  {
    trainerId: { type: Schema.Types.ObjectId, required: true, ref: "Trainer" },
    clientId: { type: String },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:mm format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:mm format"],
    },
    status: {
      type: String,
      enum: Object.values(SlotStatus),
      default: SlotStatus.AVAILABLE,
    },
    isBooked: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    expiresAt: { type: Date }
  },
  {
    timestamps: true,
  }
);

slotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
slotSchema.index({ trainerId: 1, startTime: 1, endTime: 1 });