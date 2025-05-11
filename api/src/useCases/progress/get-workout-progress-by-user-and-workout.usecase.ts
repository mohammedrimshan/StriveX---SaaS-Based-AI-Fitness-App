import { injectable, inject } from "tsyringe";
import { IGetWorkoutProgressByUserAndWorkoutUseCase } from "@/entities/useCaseInterfaces/progress/get-workout-progress-by-user-and-workout.usecase.interface";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetWorkoutProgressByUserAndWorkoutUseCase implements IGetWorkoutProgressByUserAndWorkoutUseCase {
  constructor(
    @inject("IWorkoutProgressRepository") private workoutProgressRepository: IWorkoutProgressRepository
  ) {}

  async execute(userId: string, workoutId: string): Promise<IWorkoutProgressEntity | null> {
    if (!userId || !workoutId) {
      throw new CustomError("User ID and Workout ID are required", HTTP_STATUS.BAD_REQUEST);
    }

    return this.workoutProgressRepository.findByUserAndWorkout(userId, workoutId);
  }
}