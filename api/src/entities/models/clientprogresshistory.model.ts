import { Types } from "mongoose";

export interface IClientProgressHistoryEntity{
  userId: Types.ObjectId;
  weight: number;
  height: number;
  waterIntake: number;
  waterIntakeTarget: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}