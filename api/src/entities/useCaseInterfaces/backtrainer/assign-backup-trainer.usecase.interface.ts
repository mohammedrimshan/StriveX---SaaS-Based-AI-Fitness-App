import { IClientEntity } from "@/entities/models/client.entity";

export interface IAssignBackupTrainerUseCase {
  execute(clientId: string): Promise<IClientEntity>;
}