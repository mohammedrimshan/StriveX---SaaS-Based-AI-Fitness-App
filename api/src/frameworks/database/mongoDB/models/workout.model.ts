import { model, Document, Types } from "mongoose";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { WorkoutSchema } from "../schemas/workout.schema";

export interface IWorkoutModel extends Omit<IWorkoutEntity, "id" | "category">, Document {
  _id: Types.ObjectId;
  category: Types.ObjectId
}

export const WorkoutModel = model<IWorkoutModel>("Workout", WorkoutSchema);