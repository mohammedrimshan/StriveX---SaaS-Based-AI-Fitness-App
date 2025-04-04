import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IUpdateWorkoutUseCase {
    execute(id: string, workoutData: Partial<IWorkoutEntity>, files?: { image?: string; music?: string }): Promise<IWorkoutEntity>;
  }