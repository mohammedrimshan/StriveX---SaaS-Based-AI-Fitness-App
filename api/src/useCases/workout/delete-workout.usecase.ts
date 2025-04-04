import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IDeleteWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/delete-workout-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class DeleteWorkoutUseCase implements IDeleteWorkoutUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private workoutRepository: IWorkoutRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    const workout = await this.workoutRepository.findById(id);
    if (!workout) {
      throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
    }

    try {
      const deleted = await this.workoutRepository.delete(id);
      return deleted;
    } catch (error) {
      throw new CustomError(
        "Failed to delete workout",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}