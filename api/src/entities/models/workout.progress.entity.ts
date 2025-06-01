import { ObjectId, Types } from "mongoose";

export interface IWorkoutProgressEntity {
  id: string;
  userId: ObjectId;
  workoutId: string;
  date: Date;
  duration: number;
  caloriesBurned: number;
  categoryId: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkoutVideoProgressEntity {
  id?: string;
  userId: string;
  workoutId: string;
  exerciseProgress: {
    exerciseId: string;
    videoProgress: number;
    status: "Not Started" | "In Progress" | "Completed";
    lastUpdated: Date;
  }[];
  completedExercises: string[];
  status: "Not Started" | "In Progress" | "Completed";
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}