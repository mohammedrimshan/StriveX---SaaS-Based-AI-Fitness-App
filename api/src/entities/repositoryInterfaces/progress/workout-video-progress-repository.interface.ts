import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IWorkoutVideoProgressRepository {
  findByUserAndWorkout(userId: string, workoutId: string): Promise<IWorkoutVideoProgressEntity | null>;
  findUserVideoProgress(
    userId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IWorkoutVideoProgressEntity[] | []; total: number }>;
  updateVideoProgress(
    userId: string,
    workoutId: string,
    exerciseId: string,
    videoProgress: number,
    status: "Not Started" | "In Progress" | "Completed",
    completedExercises: string[]
  ): Promise<IWorkoutVideoProgressEntity>;
}