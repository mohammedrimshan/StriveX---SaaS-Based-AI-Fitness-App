// api\src\entities\repositoryInterfaces\workout\workout-repository.interface.ts
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { IBaseRepository } from "../base-repository.interface";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";
export interface IWorkoutRepository extends IBaseRepository<IWorkoutEntity>{
  findByCategory(categoryId: string): Promise<IWorkoutEntity[]>;
  updateStatus(id: string, status: boolean): Promise<IWorkoutEntity | null>;
  count(filter: any): Promise<number>
  findAll(skip: number, limit: number, filter: any): Promise<PaginatedResult<IWorkoutEntity>>;
}