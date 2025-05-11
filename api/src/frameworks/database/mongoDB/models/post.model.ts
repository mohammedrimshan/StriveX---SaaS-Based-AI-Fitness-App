import { Schema, model, Document, ObjectId } from "mongoose";
import { IPostEntity } from "@/entities/models/post.entity";
import { postSchema } from "../schemas/post.schema";
export interface IPostModel extends Omit<IPostEntity, "id">, Document {
  _id: ObjectId;
}

export const PostModel = model<IPostModel>("Post", postSchema);