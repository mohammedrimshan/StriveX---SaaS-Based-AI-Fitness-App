export interface IAxiosResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface IWorkoutProgressEntity {
  id: string;
  userId: string;
  workoutId: string;
  duration: number;
  caloriesBurned: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkoutVideoProgressEntity {
  id: string;
  userId: string;
  workoutId: string;
  videoProgress: number;
  status: "Not Started"| "In Progress"| "Completed";
  completedExercises: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutProgressData {
  workoutId: string;
  duration: number;
  caloriesBurned: number;
}

export interface UpdateWorkoutProgressData {
  duration?: number;
  caloriesBurned?: number;
}

export interface UpdateWorkoutVideoProgressData {
  workoutId: string;
  videoProgress: number;
  status:"Not Started"| "In Progress"| "Completed";
  completedExercises?: string[];
  userId?: string;
  exerciseId: string;
}