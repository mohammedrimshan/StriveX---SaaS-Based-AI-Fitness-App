import { Types } from "mongoose";

export interface IWorkoutProgressEntity {
  id: string;
  userId: string;
  workoutId: string;
  date: Date;
  duration: number;
  caloriesBurned: number;
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
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}