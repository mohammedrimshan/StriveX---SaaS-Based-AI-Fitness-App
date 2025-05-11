import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IGetWorkoutsByCategoryUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-category-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS,ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetWorkoutsByCategoryUseCase implements IGetWorkoutsByCategoryUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private _workoutRepository: IWorkoutRepository
  ) {}

  async execute(categoryId: string): Promise<IWorkoutEntity[]> {
    try {
      return await this._workoutRepository.findByCategory(categoryId);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.FETCH_WORKOUT_BY_CATEGORY_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}