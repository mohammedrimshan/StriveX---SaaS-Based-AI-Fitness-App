// api\src\interfaceAdapters\repositories\workout\workout.repository.ts
import { injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { WorkoutModel } from "@/frameworks/database/mongoDB/models/workout.model";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";

@injectable()
export class WorkoutRepository implements IWorkoutRepository {
  async create(workout: Omit<IWorkoutEntity, "_id">): Promise<IWorkoutEntity> {
    return await WorkoutModel.create(workout);
  }

  async findById(id: string): Promise<IWorkoutEntity | null> {
    return await WorkoutModel.findById(id);
  }

  async findAll(skip: number, limit: number, filter: any): Promise<PaginatedResult<IWorkoutEntity>> {
    const [workouts, total] = await Promise.all([
      WorkoutModel.find(filter).skip(skip).limit(limit).populate("category"),
      WorkoutModel.countDocuments(filter),
    ]);

    const page = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data: workouts,
      total,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalPages,
    };
  }

  async findByCategory(categoryId: string): Promise<IWorkoutEntity[]> {
    return await WorkoutModel.find({ category: categoryId, status: true }).populate("category");
  }

  async update(id: string, workout: Partial<IWorkoutEntity>): Promise<IWorkoutEntity | null> {
    return await WorkoutModel.findByIdAndUpdate(id, workout, { new: true });
  }

  async updateStatus(id: string, status: boolean): Promise<IWorkoutEntity | null> {
    return await WorkoutModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await WorkoutModel.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter: any): Promise<number> {
    return await WorkoutModel.countDocuments(filter);
  }
}