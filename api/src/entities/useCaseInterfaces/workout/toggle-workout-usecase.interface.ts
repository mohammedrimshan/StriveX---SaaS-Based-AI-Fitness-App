import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IToggleWorkoutStatusUseCase {
    execute(id: string): Promise<IWorkoutEntity | null>;
  }
  