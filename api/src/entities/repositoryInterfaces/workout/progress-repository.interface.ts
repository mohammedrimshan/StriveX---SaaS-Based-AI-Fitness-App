// api/src/entities/repositoryInterfaces/workout/progress-repository.interface.ts
import { IProgressEntity } from "@/entities/models/progress.entity";

export interface IProgressRepository {
  create(progress: Omit<IProgressEntity, '_id'>): Promise<IProgressEntity>;
  findByUser(userId: string): Promise<IProgressEntity[]>;
  findByWorkout(workoutId: string): Promise<IProgressEntity[]>;
  findByUserAndWorkout(userId: string, workoutId: string): Promise<IProgressEntity[]>;
}