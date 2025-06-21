import { IBackupTrainerInvitationEntity } from "../../models/backuptrainerinvitation.entity";

export interface IGetTrainerBackupInvitationsUseCase {
  execute(trainerId: string, skip: number, limit: number): Promise<{ items: IBackupTrainerInvitationEntity[]; total: number }>;
}