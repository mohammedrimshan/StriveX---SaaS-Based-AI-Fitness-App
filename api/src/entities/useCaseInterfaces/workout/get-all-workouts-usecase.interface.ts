import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";

export interface IGetAllAdminWorkoutsUseCase {
  execute(page: number, limit: number, filter: any): Promise<PaginatedResult<IWorkoutEntity>>;
}