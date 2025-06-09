import { IPopularWorkout } from "@/entities/models/admin-dashboard.entity";

export interface IGetPopularWorkoutsUseCase {
  execute(limit?: number): Promise<IPopularWorkout[]>;
}