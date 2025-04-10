
import { ObjectId } from "mongoose";

export interface IProgressEntity {
  clientId: ObjectId;
  workoutId: ObjectId;
  completedDuration: number; 
  customSessions: {
    exerciseDuration: number; 
    restDuration: number; 
  }[];
  date: Date;
  caloriesBurned?: number;
}

