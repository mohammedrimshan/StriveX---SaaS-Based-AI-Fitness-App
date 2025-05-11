import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";

export interface ICreateWorkoutProgressUseCase {
  execute(data: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity>;
}