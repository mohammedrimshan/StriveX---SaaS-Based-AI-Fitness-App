import { ITopTrainer } from "@/entities/models/admin-dashboard.entity";

export interface IGetTopPerformingTrainersUseCase {
  execute(limit?: number): Promise<ITopTrainer[]>;
}