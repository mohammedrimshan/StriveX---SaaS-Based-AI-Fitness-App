
import { injectable } from "tsyringe";
import { IProgressRepository } from "@/entities/repositoryInterfaces/workout/progress-repository.interface";
import { ProgressModel } from "@/frameworks/database/mongoDB/models/progress.model";
import { IProgressEntity } from "@/entities/models/progress.entity";

@injectable()
export class ProgressRepository implements IProgressRepository {
  async create(progress: Omit<IProgressEntity, '_id'>): Promise<IProgressEntity> {
    return await ProgressModel.create(progress);
  }

  async findByUser(userId: string): Promise<IProgressEntity[]> {
    return await ProgressModel.find({ userId });
  }

  async findByWorkout(workoutId: string): Promise<IProgressEntity[]> {
    return await ProgressModel.find({ workoutId });
  }

  async findByUserAndWorkout(userId: string, workoutId: string): Promise<IProgressEntity[]> {
    return await ProgressModel.find({ userId, workoutId });
  }
}