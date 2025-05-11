import { injectable, inject } from "tsyringe";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { IGetUserProgressMetricsUseCase } from "@/entities/useCaseInterfaces/progress/get-user-progress-metrics.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";



@injectable()
export class GetUserProgressMetricsUseCase implements IGetUserProgressMetricsUseCase {
  constructor(
    @inject("IWorkoutProgressRepository") private workoutProgressRepository: IWorkoutProgressRepository
  ) {}

  async execute(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    workoutProgress: IWorkoutProgressEntity[];
    bmi: number | null;
    weightHistory: { weight: number; date: Date }[];
    heightHistory: { height: number; date: Date }[];
    waterIntakeLogs: { actual: number; target: number; date: Date }[];
  }> {
    if (!userId) {
        console.log(userId,"User ID is required for progress metrics retrieval");
      throw new CustomError("User ID is required", HTTP_STATUS.BAD_REQUEST);
    }
    console.log(startDate,endDate,"User progress metrics retrieved successfully");
    return this.workoutProgressRepository.getUserProgressMetrics(userId, startDate, endDate);
  
  }
}