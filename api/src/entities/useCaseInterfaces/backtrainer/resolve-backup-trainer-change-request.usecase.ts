import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";

export interface IResolveBackupTrainerChangeRequestUseCase {
  execute(requestId: string, adminId: string, action: "approve" | "reject"): Promise<ITrainerChangeRequestEntity>;
}