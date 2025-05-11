import { Schema, Types } from "mongoose";
import { IWorkoutProgressModel } from "../models/workout-progress.model";

export const WorkoutProgressSchema = new Schema<IWorkoutProgressModel>(
  {
    userId: { type: String, required: true, ref: "Client" },
    workoutId: { type: Schema.Types.ObjectId, required: true, ref: "Workout" },
    date: { type: Date, required: true, default: Date.now },
    duration: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    completed: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

WorkoutProgressSchema.index({ userId: 1, workoutId: 1, date: 1 });