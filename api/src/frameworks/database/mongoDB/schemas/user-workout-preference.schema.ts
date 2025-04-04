// api\src\frameworks\database\mongoDB\schemas\user-workout-preference.schema.ts
import { Schema, Types } from "mongoose";
import { IUserWorkoutPreference } from "@/entities/models/user-workout-preference.entity";

const CustomRestDurationSchema = new Schema({
  exerciseIndex: { type: Number, required: true },
  restDuration: { type: Number, required: true }, // in seconds
});

export const UserWorkoutPreferenceSchema = new Schema<IUserWorkoutPreference>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  workoutId: { type: Schema.Types.ObjectId, ref: "Workout", required: true },
  customRestDurations: [CustomRestDurationSchema],
}, { timestamps: true });