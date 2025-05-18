import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WorkoutVideoProgressState {
  [workoutId: string]: {
    exerciseProgress: { exerciseId: string; videoProgress: number; status: "Not Started" | "In Progress" | "Completed" }[];
    completedExercises: string[];
    currentExerciseIndex: number;
    workoutCompleted: boolean;
  };
}

const initialState: WorkoutVideoProgressState = {};

const workoutProgressSlice = createSlice({
  name: "workoutProgress",
  initialState,
  reducers: {
    setWorkoutProgress(
      state,
      action: PayloadAction<{
        workoutId: string;
        exerciseProgress: { exerciseId: string; videoProgress: number; status: "Not Started" | "In Progress" | "Completed" }[];
        completedExercises: string[];
        currentExerciseIndex?: number; 
        workoutCompleted?: boolean; 
      }>
    ) {
      const { workoutId, exerciseProgress, completedExercises, currentExerciseIndex = 0, workoutCompleted = false } = action.payload;
      state[workoutId] = {
        exerciseProgress,
        completedExercises,
        currentExerciseIndex,
        workoutCompleted: workoutCompleted || exerciseProgress.every((ep) => ep.status === "Completed"),
      };
    },
    updateExerciseProgress(
      state,
      action: PayloadAction<{
        workoutId: string;
        exerciseId: string;
        videoProgress: number;
        status: "Not Started" | "In Progress" | "Completed";
      }>
    ) {
      const { workoutId, exerciseId, videoProgress, status } = action.payload;
      if (!state[workoutId]) {
        state[workoutId] = { exerciseProgress: [], completedExercises: [], currentExerciseIndex: 0, workoutCompleted: false };
      }
      const existingProgress = state[workoutId].exerciseProgress.find((ep) => ep.exerciseId === exerciseId);
      if (existingProgress) {
        existingProgress.videoProgress = videoProgress;
        existingProgress.status = status;
      } else {
        state[workoutId].exerciseProgress.push({ exerciseId, videoProgress, status });
      }
      state[workoutId].workoutCompleted = state[workoutId].exerciseProgress.every((ep) => ep.status === "Completed");
    },
    addCompletedExercise(
      state,
      action: PayloadAction<{
        workoutId: string;
        exerciseId: string;
      }>
    ) {
      const { workoutId, exerciseId } = action.payload;
      if (!state[workoutId]) {
        state[workoutId] = { exerciseProgress: [], completedExercises: [], currentExerciseIndex: 0, workoutCompleted: false };
      }
      if (!state[workoutId].completedExercises.includes(exerciseId)) {
        state[workoutId].completedExercises.push(exerciseId);
      }
      state[workoutId].workoutCompleted = state[workoutId].exerciseProgress.every((ep) => ep.status === "Completed");
    },
    setCurrentExerciseIndex(
      state,
      action: PayloadAction<{
        workoutId: string;
        index: number;
      }>
    ) {
      const { workoutId, index } = action.payload;
      if (!state[workoutId]) {
        state[workoutId] = { exerciseProgress: [], completedExercises: [], currentExerciseIndex: 0, workoutCompleted: false };
      }
      state[workoutId].currentExerciseIndex = index;
    },
    resetWorkoutProgress(state, action: PayloadAction<{ workoutId: string }>) {
      delete state[action.payload.workoutId];
    },
  },
});

export const { setWorkoutProgress, updateExerciseProgress, addCompletedExercise, setCurrentExerciseIndex, resetWorkoutProgress } = workoutProgressSlice.actions;
export default workoutProgressSlice.reducer;