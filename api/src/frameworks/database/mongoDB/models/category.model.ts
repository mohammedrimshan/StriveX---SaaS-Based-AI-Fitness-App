import { Document, model, ObjectId } from "mongoose";
import { CategorySchema } from "../schemas/category.schema";
import { ICategoryEntity } from "@/entities/models/category.entity";
export interface ICategoryModel extends Omit<ICategoryEntity, "_id">, Document {
  _id: ObjectId;
}

export const CategoryModel = model<ICategoryModel>("Category", CategorySchema);
