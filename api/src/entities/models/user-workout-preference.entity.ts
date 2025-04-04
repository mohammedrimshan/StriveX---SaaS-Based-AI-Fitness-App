
import { Types } from "mongoose";

export interface IUserWorkoutPreference {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  workoutId: Types.ObjectId;
  customRestDurations: {
    exerciseIndex: number; 
    restDuration: number; 
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}