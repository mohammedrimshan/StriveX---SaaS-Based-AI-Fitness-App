import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";

export interface IRequestBackupTrainerChangeUseCase {
  execute(clientId: string, requestType: "CHANGE" | "REVOKE", reason?: string): Promise<ITrainerChangeRequestEntity>;
}