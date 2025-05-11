import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IToggleWorkoutStatusUseCase } from "@/entities/useCaseInterfaces/workout/toggle-workout-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS,ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class ToggleWorkoutStatusUseCase implements IToggleWorkoutStatusUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private _workoutRepository: IWorkoutRepository
  ) {}

  async execute(id: string): Promise<IWorkoutEntity | null> {
    const workout = await this._workoutRepository.findById(id);
    if (!workout) {
      throw new CustomError(ERROR_MESSAGES.WORKOUT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    try {
      const newStatus = !workout.status;
      const updatedWorkout = await this._workoutRepository.updateStatus(id, newStatus);
      return updatedWorkout;
    } catch {
      throw new CustomError(
        ERROR_MESSAGES.WORKOUT_STATUS_UPDATE_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}