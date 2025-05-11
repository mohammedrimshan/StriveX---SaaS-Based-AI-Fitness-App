import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IGetUserWorkoutProgressUseCase {
  execute(
    userId: string,
    skip: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ items: IWorkoutProgressEntity[]; total: number }>;
}