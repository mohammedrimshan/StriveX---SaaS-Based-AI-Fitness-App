// api/src/entities/models/progress.entity.ts
import { ObjectId } from "mongoose";

export interface IProgressEntity {
  clientId: ObjectId;
  workoutId: ObjectId;
  completedDuration: number; // in minutes
  customSessions: {
    exerciseDuration: number; // in seconds
    restDuration: number; // in seconds
  }[];
  date: Date;
  caloriesBurned?: number;
}

