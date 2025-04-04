import {model, Document, ObjectId } from "mongoose";
import { IProgressEntity } from "@/entities/models/progress.entity";
import { ProgressSchema } from "../schemas/progress.schema";

export interface IProgressModel extends Omit<IProgressEntity, "_id">, Document {
    _id: ObjectId;
  }


export const ProgressModel = model<IProgressEntity>("Progress", ProgressSchema);