import { Schema } from "mongoose";
import { ICategoryModel } from "../models/category.model";

export const CategorySchema = new Schema<ICategoryModel>(
  {
    categoryId: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

CategorySchema.index({ status: 1 });