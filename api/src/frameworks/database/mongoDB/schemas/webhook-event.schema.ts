import { Schema } from "mongoose";

export const webhookEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    processedAt: { type: Date, required: true },
  },
  { timestamps: true }
);