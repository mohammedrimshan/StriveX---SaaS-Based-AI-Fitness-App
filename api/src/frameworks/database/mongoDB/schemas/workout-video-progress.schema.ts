import { Schema } from "mongoose";
import { IWorkoutVideoProgressModel } from "../models/workout-video-progress.model";

export const WorkoutVideoProgressSchema = new Schema<IWorkoutVideoProgressModel>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "Client" },
    workoutId: { type: Schema.Types.ObjectId, required: true, ref: "Workout" },
    exerciseProgress: [
      {
        exerciseId: { type: Schema.Types.ObjectId, required: true },
        videoProgress: { type: Number, required: true, min: 0, max: 100 },
        status: {
          type: String,
          required: true,
          enum: ["Not Started", "In Progress", "Completed"],
          default: "Not Started",
        },
        lastUpdated: { type: Date, required: true, default: Date.now },
        clientTimestamp: { type: String, required: false },
      },
    ],
    completedExercises: [{ type: Schema.Types.ObjectId }],
    lastUpdated: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

WorkoutVideoProgressSchema.index({ userId: 1, workoutId: 1, exerciseId: 1 }, { unique: true });