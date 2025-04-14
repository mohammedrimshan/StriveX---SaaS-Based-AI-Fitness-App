import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IGetWorkoutByIdUseCase {
  execute(workoutId: string): Promise<IWorkoutEntity | null>;
}