import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";

export interface IGetWorkoutsUseCase {
  execute(filter: any, page: number, limit: number): Promise<PaginatedResult<IWorkoutEntity>>;
}

