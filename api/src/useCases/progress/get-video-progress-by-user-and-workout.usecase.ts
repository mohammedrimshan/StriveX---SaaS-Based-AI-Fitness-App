import { injectable, inject } from "tsyringe";
import { IGetVideoProgressByUserAndWorkoutUseCase } from "@/entities/useCaseInterfaces/progress/get-video-progress-by-user-and-workout.usecase.interface";
import { IWorkoutVideoProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-video-progress-repository.interface";
import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetVideoProgressByUserAndWorkoutUseCase implements IGetVideoProgressByUserAndWorkoutUseCase {
  constructor(
    @inject("IWorkoutVideoProgressRepository") private workoutVideoProgressRepository: IWorkoutVideoProgressRepository
  ) {}

  async execute(userId: string, workoutId: string): Promise<IWorkoutVideoProgressEntity | null> {
    if (!userId || !workoutId) {
      throw new CustomError("User ID and Workout ID are required", HTTP_STATUS.BAD_REQUEST);
    }

    return this.workoutVideoProgressRepository.findByUserAndWorkout(userId, workoutId);
  }
}