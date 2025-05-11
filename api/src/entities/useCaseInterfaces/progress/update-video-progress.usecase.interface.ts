import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IUpdateVideoProgressUseCase {
  execute(
    userId: string,
    workoutId: string,
    videoProgress: number,
    status: "Not Started" | "In Progress" | "Completed",
    completedExercises: string[],
    exerciseId: string
  ): Promise<IWorkoutVideoProgressEntity>;
}