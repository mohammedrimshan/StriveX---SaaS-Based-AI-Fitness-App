import { Schema } from "mongoose";
import { ICancellationModel } from "../models/cancellation.model";

export const cancellationSchema = new Schema<ICancellationModel>(
  {
    slotId: { type: Schema.Types.ObjectId, required: true, ref: "Slot" },
    clientId: { type: Schema.Types.ObjectId, required: true, ref: "Client" },
    trainerId: { type: Schema.Types.ObjectId, required: true, ref: "Trainer" },
    cancellationReason: { type: String, required: true },
    cancelledBy: {
      type: String,
      enum: ["trainer", "client"],
      required: true,
    },
    cancelledAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

cancellationSchema.index({ slotId: 1, trainerId: 1 });
cancellationSchema.index({ cancelledAt: 1 });
