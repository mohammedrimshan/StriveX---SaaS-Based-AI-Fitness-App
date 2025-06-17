import { clientAxiosInstance } from "@/api/client.axios";
import { IAxiosResponse } from "@/types/Response";
import { ProgressMetricsResponse } from "@/types/progressMetrics";

export interface IWorkoutProgressEntity {
  _id: string; 
  userId: string;
  workoutId: string;
  duration: number;
  caloriesBurned: number;
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseDetails {
  _id: string;
  name: string;
  description: string;
  duration: number;
  videoUrl: string;
  defaultRestDuration: number;
}

export interface ExerciseProgress {
  _id?: string;
  exerciseId: string;
  videoProgress: number;
  status: "Not Started" | "In Progress" | "Completed";
  lastUpdated?: Date;
  clientTimestamp?: string;
  exerciseDetails?: ExerciseDetails;
}

export interface IWorkoutVideoProgressEntity {
  _id?: string;
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

export interface CreateWorkoutProgressData {
  userId: string;
  workoutId: string;
  duration: number;
  caloriesBurned: number;
  completed: boolean;
  categoryId: string;
}

export interface UpdateWorkoutProgressData {
  duration?: number;
  caloriesBurned?: number;
  completed?: boolean;
}

export interface UpdateWorkoutVideoProgressData {
  workoutId: string;
  videoProgress: number;
  status?: "Not Started" | "In Progress" | "Completed";
  completedExercises?: string[];
  userId?: string;
  exerciseId: string;
}

// Workout Progress Functions
export const createWorkoutProgress = async (
  data: CreateWorkoutProgressData
): Promise<IWorkoutProgressEntity> => {
  try {
    if (!data.userId) {
      throw new Error("Invalid or missing userId");
    }
    if (!data.workoutId) {
      throw new Error("Invalid or missing workoutId");
    }
    if (!data.duration || data.duration <= 0) {
      throw new Error("Invalid or missing duration");
    }
    console.log("Creating workout progress with data:", data);
    const response = await clientAxiosInstance.post<
      IAxiosResponse<IWorkoutProgressEntity>
    >("/client/progress/workout", data);
    console.log("Workout progress created:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Create workout progress error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create workout progress"
    );
  }
};

export const updateWorkoutProgress = async (
  progressId: string,
  data: UpdateWorkoutProgressData
): Promise<IWorkoutProgressEntity> => {
  try {
    const response = await clientAxiosInstance.patch<
      IAxiosResponse<IWorkoutProgressEntity>
    >(`/client/progress/workout/${progressId}`, data);
    console.log("Workout progress updated:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Update workout progress error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to update workout progress"
    );
  }
};

export const getUserWorkoutProgress = async (
  userId: string
): Promise<IWorkoutProgressEntity[]> => {
  try {
    if (!userId) {
      console.warn("getUserWorkoutProgress called with empty userId");
      return [];
    }

    const response = await clientAxiosInstance.get<
      IAxiosResponse<IWorkoutProgressEntity[]>
    >(`/client/progress/workout/user/${userId}`);
    console.log("User workout progress:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Get user workout progress error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch user workout progress"
    );
  }
};

export const getWorkoutProgressByUserAndWorkout = async (
  userId: string,
  workoutId: string
): Promise<IWorkoutProgressEntity[]> => {
  try {
    if (!userId || !workoutId) {
      console.warn(
        "getWorkoutProgressByUserAndWorkout called with empty userId or workoutId"
      );
      return [];
    }

    const response = await clientAxiosInstance.get<
      IAxiosResponse<IWorkoutProgressEntity[]>
    >(`/client/progress/workout/user/${userId}/workout/${workoutId}`);
    console.log("Workout progress by user and workout:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Get workout progress by user and workout error:",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch workout progress"
    );
  }
};

// Workout Video Progress Functions
export const updateWorkoutVideoProgress = async (
  data: UpdateWorkoutVideoProgressData
): Promise<IWorkoutVideoProgressEntity> => {
  try {
    if (!data.userId) {
      throw new Error("userId is required to update workout video progress");
    }

    if (
      data.status &&
      !["Not Started", "In Progress", "Completed"].includes(data.status)
    ) {
      throw new Error(`Invalid status: ${data.status}`);
    }

    console.log("Sending video progress update:", data);

    const response = await clientAxiosInstance.patch<
      IAxiosResponse<IWorkoutVideoProgressEntity>
    >("/client/progress/video", data);
    console.log("Video progress updated:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Update video progress error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update video progress"
    );
  }
};

export const getUserWorkoutVideoProgress = async (
  userId: string
): Promise<IWorkoutVideoProgressEntity[]> => {
  try {
    if (!userId) {
      console.warn("getUserWorkoutVideoProgress called with empty userId");
      return [];
    }

    const response = await clientAxiosInstance.get<
      IAxiosResponse<IWorkoutVideoProgressEntity[]>
    >(`/client/progress/video/user/${userId}`);
    console.log("User video progress:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Get user video progress error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch user video progress"
    );
  }
};

export const getWorkoutVideoProgressByUserAndWorkout = async (
  userId: string,
  workoutId: string
): Promise<IWorkoutVideoProgressEntity> => {
  try {
    if (!userId || !workoutId) {
      console.warn(
        "getWorkoutVideoProgressByUserAndWorkout called with empty userId or workoutId"
      );
      throw new Error("userId and workoutId are required");
    }

    const response = await clientAxiosInstance.get<
      IAxiosResponse<IWorkoutVideoProgressEntity>
    >(`/client/progress/video/user/${userId}/workout/${workoutId}`);
    console.log("Video progress by user and workout:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Get video progress by user and workout error:",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch video progress"
    );
  }
};

export const getUserProgressMetrics = async (
  userId: string
): Promise<ProgressMetricsResponse> => {
  try {
    if (!userId) {
      console.warn("getUserProgressMetrics called with empty userId");
      throw new Error("userId is required");
    }

    const response = await clientAxiosInstance.get<ProgressMetricsResponse>(
      `/client/progress/workout/metrics/${userId}`
    );
    console.log("User progress metrics response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Get user progress metrics error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch user progress metrics"
    );
  }
};