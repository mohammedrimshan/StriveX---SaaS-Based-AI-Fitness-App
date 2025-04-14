
import { Types } from "mongoose";

export interface IExerciseEntity {
  _id?: string; 
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
  videoUrl: string;
}

export interface IWorkoutEntity {
  id?: string;
  title: string;
  description: string;
  category: string; 
  duration: number; 
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string; 
  exercises:IExerciseEntity[];
  isPremium: boolean; 
  status: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}