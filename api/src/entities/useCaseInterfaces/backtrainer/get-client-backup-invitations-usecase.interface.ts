import { IBackupTrainerInvitationEntity } from "@/entities/models/backuptrainerinvitation.entity";

export interface IGetClientBackupInvitationsUseCase {
  execute(clientId: string, skip: number, limit: number): Promise<{ items: IBackupTrainerInvitationEntity[]; total: number }>;
}