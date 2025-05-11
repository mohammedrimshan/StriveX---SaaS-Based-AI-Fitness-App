import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IGetVideoProgressByUserAndWorkoutUseCase {
  execute(userId: string, workoutId: string): Promise<IWorkoutVideoProgressEntity | null>;
}