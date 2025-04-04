
import { Types } from "mongoose";

export interface IWorkoutEntity {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  category: Types.ObjectId; 
  duration: number; 
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string; 
  exercises: {
    name: string;
    description: string;
    duration: number; 
    defaultRestDuration: number; 
  }[];
  isPremium: boolean; 
  status: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}