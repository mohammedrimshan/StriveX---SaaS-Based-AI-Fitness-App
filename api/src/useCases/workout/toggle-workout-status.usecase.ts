import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IToggleWorkoutStatusUseCase } from "@/entities/useCaseInterfaces/workout/toggle-workout-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class ToggleWorkoutStatusUseCase implements IToggleWorkoutStatusUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private workoutRepository: IWorkoutRepository
  ) {}

  async execute(id: string): Promise<IWorkoutEntity | null> {
    const workout = await this.workoutRepository.findById(id);
    if (!workout) {
      throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
    }

    try {
      const newStatus = !workout.status;
      const updatedWorkout = await this.workoutRepository.updateStatus(id, newStatus);
      return updatedWorkout;
    } catch (error) {
      throw new CustomError(
        "Failed to toggle workout status",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}