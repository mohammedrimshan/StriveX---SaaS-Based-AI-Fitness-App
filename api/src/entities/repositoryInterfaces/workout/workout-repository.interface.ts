// api\src\entities\repositoryInterfaces\workout\workout-repository.interface.ts
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";

export interface IWorkoutRepository {
  create(workout: Omit<IWorkoutEntity, "_id">): Promise<IWorkoutEntity>;
  findById(id: string): Promise<IWorkoutEntity | null>;
  findAll(skip: number, limit: number, filter: any): Promise<PaginatedResult<IWorkoutEntity>>;
  findByCategory(categoryId: string): Promise<IWorkoutEntity[]>;
  update(id: string, workout: Partial<IWorkoutEntity>): Promise<IWorkoutEntity | null>;
  updateStatus(id: string, status: boolean): Promise<IWorkoutEntity | null>;
  delete(id: string): Promise<boolean>;
  count(filter: any): Promise<number>;
}