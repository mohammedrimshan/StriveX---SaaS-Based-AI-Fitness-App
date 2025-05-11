import { Schema, model, Document, ObjectId } from "mongoose";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { commentSchema } from "../schemas/comment.schema";

export interface ICommentModel extends Omit<ICommentEntity, "id">, Document {
  _id: ObjectId;
}


export const CommentModel = model<ICommentModel>("Comment", commentSchema);