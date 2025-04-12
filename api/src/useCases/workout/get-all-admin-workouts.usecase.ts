import { injectable, inject } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { IGetAllAdminWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-all-workouts-usecase.interface";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";

@injectable()
export class GetAllAdminWorkoutsUseCase implements IGetAllAdminWorkoutsUseCase {
  constructor(
    @inject("IWorkoutRepository") private _workoutRepository: IWorkoutRepository
  ) {}

  async execute(page: number, limit: number, filter: any): Promise<PaginatedResult<IWorkoutEntity>> {
    const skip = (page - 1) * limit;
    const result = await this._workoutRepository.findAll(skip, limit, filter);

    return {
      data: result.data, 
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
      totalPages: result.totalPages,
    };
  }
}