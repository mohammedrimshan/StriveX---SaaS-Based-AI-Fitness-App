import { injectable, inject } from "tsyringe";
import { IGetUserVideoProgressUseCase } from "@/entities/useCaseInterfaces/progress/get-user-video-progress.usecase.interface";
import { IWorkoutVideoProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-video-progress-repository.interface";
import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetUserVideoProgressUseCase implements IGetUserVideoProgressUseCase {
  constructor(
    @inject("IWorkoutVideoProgressRepository") private workoutVideoProgressRepository: IWorkoutVideoProgressRepository
  ) {}

  async execute(
    userId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IWorkoutVideoProgressEntity[]; total: number }> {
  
    if (!userId) {
      throw new CustomError("User ID is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (skip < 0 || limit <= 0) {
      throw new CustomError("Invalid pagination parameters", HTTP_STATUS.BAD_REQUEST);
    }

    // Retrieve progress
    return this.workoutVideoProgressRepository.findUserVideoProgress(userId, skip, limit);
  }
}