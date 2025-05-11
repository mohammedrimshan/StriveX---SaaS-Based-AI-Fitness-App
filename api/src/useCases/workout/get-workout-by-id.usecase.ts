import { inject, injectable } from "tsyringe";
import { IGetWorkoutByIdUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-id.usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS,ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetWorkoutByIdUseCase implements IGetWorkoutByIdUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private workoutRepository: IWorkoutRepository
  ) {}

  async execute(workoutId: string): Promise<IWorkoutEntity> {
    if (!workoutId) {
      throw new CustomError(
        ERROR_MESSAGES.WORKOUT_ID_REQUIRED,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    try {
      const workout = await this.workoutRepository.findById(workoutId);
      if (!workout) {
        throw new CustomError(
          ERROR_MESSAGES.WORKOUT_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }
      return workout;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_TO_FETCH_WORKOUT,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
