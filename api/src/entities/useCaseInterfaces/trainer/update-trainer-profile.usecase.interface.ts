import { ITrainerEntity } from "@/entities/models/trainer.entity";
export interface IUpdateTrainerProfileUseCase {
  execute(userId: string, data: Partial<ITrainerEntity>): Promise<ITrainerEntity>;
}