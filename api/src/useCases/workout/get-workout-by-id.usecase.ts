import { inject, injectable } from "tsyringe";
import { IGetWorkoutByIdUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-id.usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetWorkoutByIdUseCase implements IGetWorkoutByIdUseCase {
  constructor(
    @inject("IWorkoutRepository") private workoutRepository: IWorkoutRepository
  ) {}

  async execute(workoutId: string): Promise<IWorkoutEntity | null> {
    if (!workoutId) {
      throw new CustomError("Workout ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const workout = await this.workoutRepository.findById(workoutId);
    if (!workout) {
      throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
    }

    return workout;
  }
}