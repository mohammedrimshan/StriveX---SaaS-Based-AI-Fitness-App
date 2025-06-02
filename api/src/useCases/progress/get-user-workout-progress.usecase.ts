import { injectable, inject } from "tsyringe";
import { IGetUserWorkoutProgressUseCase } from "@/entities/useCaseInterfaces/progress/get-user-workout-progress.usecase.interface";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetUserWorkoutProgressUseCase implements IGetUserWorkoutProgressUseCase {
  constructor(
    @inject("IWorkoutProgressRepository") private workoutProgressRepository: IWorkoutProgressRepository
  ) {}

  async execute(
    userId: string,
    skip: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ items: IWorkoutProgressEntity[]; total: number }> {
    if (!userId) {
      throw new CustomError("User ID is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (skip < 0 || limit <= 0) {
      throw new CustomError("Invalid pagination parameters", HTTP_STATUS.BAD_REQUEST);
    }
    if (startDate && endDate && startDate > endDate) {
      throw new CustomError("Start date must be before end date", HTTP_STATUS.BAD_REQUEST);
    }

    return this.workoutProgressRepository.findUserProgress(userId, skip, limit, startDate, endDate);
  }
}