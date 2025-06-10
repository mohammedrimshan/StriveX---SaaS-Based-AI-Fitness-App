
export interface ProgressMetricsResponse {
  status?: "success" | "error"; // Assuming possible error status
  data: ProgressMetricsData;
  message: string;
}

// Main data object
export interface ProgressMetricsData {
  workoutProgress: WorkoutProgress[];
  bmi: number;
  weightHistory: WeightHistory[];
  heightHistory: HeightHistory[];
  waterIntakeLogs: WaterIntakeLog[];
  totalWaterIntake: number;
  videoProgress: VideoProgress[];
  workouts: Workout[];
  subscriptionEndDate: string;
}

// Workout progress for a specific workout session
export interface WorkoutProgress {
  id: string;
  userId: string;
  workoutId: string;
  date: string; // ISO date string (e.g., "2025-05-31T14:22:08.051Z")
  duration: number; // Duration in seconds
  caloriesBurned: number;
  completed: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Historical weight record
export interface WeightHistory {
  weight: number; // Weight in kg
  date: string; // ISO date string
}

// Historical height record
export interface HeightHistory {
  height: number; // Height in cm
  date: string; // ISO date string
}

// Water intake log (actual vs. target)
export interface WaterIntakeLog {
  actual: number; // Actual intake in ml
  target: number; // Target intake in ml
  date: string; // ISO date string
}

// Video progress for a workout
export interface VideoProgress {
  id: string;
  userId: string;
  workoutId: string;
  exerciseProgress: ExerciseProgress[];
  completedExercises: string[]; // Array of exercise IDs
  lastUpdated: string; // ISO date string
}

// Progress for an individual exercise video
export interface ExerciseProgress {
  exerciseId: string;
  videoProgress: number; // Percentage (0-100)
  status: "Completed" | "InProgress" | "NotStarted"; // Enum for status
  lastUpdated: string; // ISO date string
  clientTimestamp: string; // ISO date string
  _id: string; // MongoDB ObjectId for the exercise progress
}

// Workout details
export interface Workout {
  id: string;
  title: string; // Workout name (e.g., "Morning Flex")
  exercises: Exercise[];
}

// Individual exercise within a workout
export interface Exercise {
  name: string; // Exercise name (e.g., "Cat-Cow Stretch")
  description: string;
  duration: number; // Duration in seconds
  videoUrl: string; // URL to exercise video
  defaultRestDuration: number; // Rest duration in seconds
  _id: string; // MongoDB ObjectId for the exercise
}