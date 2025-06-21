import { IClientEntity } from "../../models/client.entity";

export interface IGetTrainerBackupClientsUseCase {
  execute(trainerId: string, skip: number, limit: number): Promise<{ items: IClientEntity[]; total: number }>;
}