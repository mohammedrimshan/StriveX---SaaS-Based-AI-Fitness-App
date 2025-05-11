import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { IBaseRepository } from "../base-repository.interface";

export interface IWorkoutProgressRepository extends IBaseRepository<IWorkoutProgressEntity> {
    findByUserAndWorkout(userId: string, workoutId: string): Promise<IWorkoutProgressEntity | null>;
    findUserProgress(
      userId: string,
      skip: number,
      limit: number,
      startDate?: Date,
      endDate?: Date
    ): Promise<{ items: IWorkoutProgressEntity[] | []; total: number }>;
    createProgress(data: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity>;
    findUserProgress(
      userId: string,
      skip: number,
      limit: number,
      startDate?: Date,
      endDate?: Date
    ): Promise<{ items: IWorkoutProgressEntity[]; total: number }>;
    
    updateProgress(id: string, updates: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity | null>;
    getUserProgressMetrics(
      userId: string,
      startDate?: Date,
      endDate?: Date
    ): Promise<{
      workoutProgress: IWorkoutProgressEntity[];
      bmi: number | null;
      weightHistory: { weight: number; date: Date }[];
      heightHistory: { height: number; date: Date }[];
      waterIntakeLogs: { actual: number; target: number; date: Date }[];
    }>
}