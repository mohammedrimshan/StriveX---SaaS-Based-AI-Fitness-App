import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IGetWorkoutProgressByUserAndWorkoutUseCase {
  execute(userId: string, workoutId: string): Promise<IWorkoutProgressEntity | null>;
}