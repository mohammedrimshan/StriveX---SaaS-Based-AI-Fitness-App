import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";

export interface IGetUserProgressMetricsUseCase {
    execute(
      userId: string,
      startDate?: Date,
      endDate?: Date
    ): Promise<{
      workoutProgress: IWorkoutProgressEntity[];
      bmi: number | null;
      weightHistory: { weight: number; date: Date }[];
      heightHistory: { height: number; date: Date }[];
      waterIntakeLogs: { actual: number; target: number; date: Date }[];
    }>;
  }
  