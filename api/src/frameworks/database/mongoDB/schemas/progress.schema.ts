// api/src/frameworks/database/mongoDB/models/progress.model.ts
import { Document, model, Schema, Types } from "mongoose";
import { IProgressEntity } from "@/entities/models/progress.entity";

const CustomSessionSchema = new Schema({
  exerciseDuration: { type: Number, required: true }, // in seconds
  restDuration: { type: Number, required: true } // in seconds
});

export const ProgressSchema = new Schema<IProgressEntity>({
clientId: { type: Types.ObjectId, ref: 'User', required: true },
  workoutId: { type: Types.ObjectId, ref: 'Workout', required: true },
  completedDuration: { type: Number, required: true }, // in minutes
  customSessions: [CustomSessionSchema],
  date: { type: Date, default: Date.now },
  caloriesBurned: { type: Number }
});

