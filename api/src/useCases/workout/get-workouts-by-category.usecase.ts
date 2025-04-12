import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IGetWorkoutsByCategoryUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-category-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetWorkoutsByCategoryUseCase implements IGetWorkoutsByCategoryUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private _workoutRepository: IWorkoutRepository
  ) {}

  async execute(categoryId: string): Promise<IWorkoutEntity[]> {
    try {
      const workouts = await this._workoutRepository.findByCategory(categoryId);
      return workouts;
    } catch (error) {
      throw new CustomError(
        "Failed to fetch workouts by category",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}