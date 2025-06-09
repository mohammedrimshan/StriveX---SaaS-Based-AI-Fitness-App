import { IReviewEntity } from "@/entities/models/review.entity";
import { reviewSchema } from "../schemas/review.schema";
import { model } from "mongoose";

export interface IReviewModel extends IReviewEntity {}

export const ReviewModel = model<IReviewModel>("Review", reviewSchema);