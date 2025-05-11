import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IDeleteWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/delete-workout-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class DeleteWorkoutUseCase implements IDeleteWorkoutUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private _workoutRepository: IWorkoutRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    if (!id) {
      throw new CustomError(ERROR_MESSAGES.WORKOUT_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    const workout = await this._workoutRepository.findById(id);
    if (!workout) {
      throw new CustomError(ERROR_MESSAGES.WORKOUT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    try {
      const deleted = await this._workoutRepository.delete(id);
      return deleted;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_TO_DELETE_WORKOUT,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
