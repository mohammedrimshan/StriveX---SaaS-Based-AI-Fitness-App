import { CategoryType } from "@/hooks/admin/useAllCategory";

export interface Exercise {
  _id?: string; 
  id?: string; 
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
  videoUrl: string;
}

export interface Workout {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
  exercises: Exercise[];
  isPremium: boolean;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutDetailsPro {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: CategoryType;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
  exercises: Exercise[];
  isPremium: boolean;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}