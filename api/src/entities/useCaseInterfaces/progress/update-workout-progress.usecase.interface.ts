import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IUpdateWorkoutProgressUseCase {
  execute(id: string, updates: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity | null>;
}