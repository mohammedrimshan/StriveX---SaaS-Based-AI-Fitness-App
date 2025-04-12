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
    private _workoutRepository: IWorkoutRepository
  ) {}

  async execute(
    filter: any,
    page: number,
    limit: number
  ): Promise<PaginatedResult<IWorkoutEntity>> {
    if (!Number.isInteger(page) || page < 1) {
      throw new CustomError("Invalid page number", HTTP_STATUS.BAD_REQUEST);
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new CustomError("Invalid limit value", HTTP_STATUS.BAD_REQUEST);
    }
    const safeFilter: Record<string, any> = filter && typeof filter === "object" && !Array.isArray(filter) ? filter : {};
    console.log("Safe filter:", safeFilter);

    const skip = (page - 1) * limit;

    try {
      if (!this._workoutRepository) {
        throw new Error("Workout repository not initialized");
      }

      // Corrected argument order: skip, limit, filter
      const result = await this._workoutRepository.findAll(skip, limit, safeFilter);
      console.log(result,"RS")
      if (!result || typeof result.total !== "number" || !Array.isArray(result.data)) {
        throw new Error("Invalid response from repository");
      }

      return {
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        totalPages: result.totalPages,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error fetching workouts:", errorMessage);
      throw new CustomError(
        `Failed to fetch workouts: ${errorMessage || "Unknown error"}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}