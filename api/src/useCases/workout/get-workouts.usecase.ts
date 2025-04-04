import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IGetWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetWorkoutsUseCase implements IGetWorkoutsUseCase {
  constructor(
    @inject("IWorkoutRepository")
    private workoutRepository: IWorkoutRepository
  ) {}

  async execute(
    filter: any,
    page: number,
    limit: number
  ): Promise<PaginatedResult<IWorkoutEntity>> {
    const skip = (page - 1) * limit;

    try {
      const result = await this.workoutRepository.findAll(filter, skip, limit);
      
      return {
        ...result,
        hasNextPage: result.page * limit < result.total,
        hasPreviousPage: result.page > 1,
        totalPages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      throw new CustomError(
        "Failed to fetch workouts",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}