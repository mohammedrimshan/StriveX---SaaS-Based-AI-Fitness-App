import { IWorkoutProgressEntity, IWorkoutVideoProgressEntity } from "@/services/progress/workoutProgressService";

export interface IAxiosResponse<T> {
  data: T;
  message: string;
  status: string;
}

export interface WorkoutVideoProgressResponse {
  items: IWorkoutVideoProgressEntity[]; 
  total: number;
  success: boolean;
  message: string;
}

export interface WorkoutProgressResponse {
  items: IWorkoutProgressEntity[];
  success: boolean;
  message: string;
}

export interface WorkoutVideoAsProgressResponse {
  items: {
    items: IWorkoutVideoProgressEntity[];
    total: number;
  };
  total: number | undefined;
  success: boolean;
  message: string;
}