import { IClientEntity } from "../../models/client.entity";

export interface IGetClientBackupTrainerUseCase {
  execute(clientId: string): Promise<IClientEntity>;
}