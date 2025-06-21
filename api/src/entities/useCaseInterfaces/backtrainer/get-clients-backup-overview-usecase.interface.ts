import { IClientEntity } from "../../models/client.entity";

export interface IGetClientsBackupOverviewUseCase {
  execute(skip: number, limit: number): Promise<{ items: IClientEntity[]; total: number }>;
}