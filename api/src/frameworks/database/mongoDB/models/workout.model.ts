
import { model, Document, ObjectId } from "mongoose";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { WorkoutSchema } from "../schemas/workout.schema";

export interface IWorkoutModel extends Omit<IWorkoutEntity, "_id">, Document {
  _id: ObjectId;
}

export const WorkoutModel = model<IWorkoutEntity>("Workout", WorkoutSchema);