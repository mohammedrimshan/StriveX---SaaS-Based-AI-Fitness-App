import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IGetUserVideoProgressUseCase {
  execute(userId: string, skip: number, limit: number): Promise<{ items: IWorkoutVideoProgressEntity[]; total: number }>;
}