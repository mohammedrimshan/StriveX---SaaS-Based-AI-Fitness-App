// D:\StriveX\api\src\interfaceAdapters\repositories\workout\workout.repository.ts
import { injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { WorkoutModel, IWorkoutModel } from "@/frameworks/database/mongoDB/models/workout.model";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { PaginatedResult } from "@/entities/models/paginated-result.entity";
import { BaseRepository } from "../base.repository";

type LeanWorkout = Omit<IWorkoutModel, keyof Document>;
@injectable()
export class WorkoutRepository extends BaseRepository<IWorkoutEntity> implements IWorkoutRepository {
  constructor() {
    super(WorkoutModel);
  }

  async create(workout: Partial<IWorkoutEntity>): Promise<IWorkoutEntity> {
    const entity = await this.model.create(workout);
    return this.mapToEntity(entity.toObject());
  }

  async findAll(skip: number, limit: number, filter: any): Promise<PaginatedResult<IWorkoutEntity>> {
    const [workouts, total] = await Promise.all([
      this.model
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate("category", "title") 
        .lean(),
      this.model.countDocuments(filter),
    ]);
    console.log("Raw workouts after population:", JSON.stringify(workouts, null, 2));

    const transformedWorkouts = workouts.map((w) => this.mapToEntity({
      ...w,
      category: w.category,
    }));
    const page = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data: transformedWorkouts,
      total,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalPages,
    };
  }
  

  async findByCategory(categoryId: string): Promise<IWorkoutEntity[]> {
    const workouts = await this.model
  .find({ category: categoryId, status: true })
  .lean<LeanWorkout[]>()
  .exec();

  
    return workouts.map((w:any) => this.mapToEntity(w));
  }
  
  async updateStatus(id: string, status: boolean): Promise<IWorkoutEntity | null> {
    const workout = await this.model
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean({ virtuals: true }) // Enable virtuals if needed
      .exec() as Omit<IWorkoutModel, keyof Document> | null;
    if (!workout) return null;
    return this.mapToEntity(workout);
  }

  async count(filter: any): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}