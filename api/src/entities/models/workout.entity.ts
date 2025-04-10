
import { Types } from "mongoose";

export interface IWorkoutEntity {
  id?: string;
  title: string;
  description: string;
  category: string; 
  duration: number; 
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string; 
  exercises: {
    name: string;
    description: string;
    duration: number; 
    defaultRestDuration: number; 
    videoUrl?:string[];
  }[];
  isPremium: boolean; 
  status: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}