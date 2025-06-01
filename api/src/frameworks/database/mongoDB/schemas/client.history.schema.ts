import { Schema } from "mongoose";
import { IClientProgressHistoryModel } from "../models/client.progress.history.model";

export const ClientProgressHistorySchema = new Schema<IClientProgressHistoryModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    weight: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    waterIntake: {
      type: Number,
      default: 0,
    },
    waterIntakeTarget: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ClientProgressHistorySchema.index({ userId: 1, date: -1 });