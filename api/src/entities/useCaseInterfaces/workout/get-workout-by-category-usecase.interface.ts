import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IGetWorkoutsByCategoryUseCase {
  execute(categoryId: string): Promise<IWorkoutEntity[]>;
}