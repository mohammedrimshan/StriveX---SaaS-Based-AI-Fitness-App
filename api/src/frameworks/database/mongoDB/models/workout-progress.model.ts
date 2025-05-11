import { Document,Types, ObjectId, model } from "mongoose";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { WorkoutProgressSchema } from "../schemas/workout-progress.schema";

export interface IWorkoutProgressModel extends Omit<IWorkoutProgressEntity, "id"| "workoutId">, Document {
  _id: ObjectId;
  workoutId: Types.ObjectId;
}

export const WorkoutProgressModel = model<IWorkoutProgressModel>("WorkoutProgress", WorkoutProgressSchema);