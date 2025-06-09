import { Schema, Model } from "mongoose";
import { IReviewModel } from "../models/review.model";

export const reviewSchema = new Schema<IReviewModel>(
  {
    clientId: { type: String, required: true },
    trainerId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
    clientProfileImage: { type: String, required: false },
    clientName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ trainerId: 1, clientId: 1 }, { unique: true });