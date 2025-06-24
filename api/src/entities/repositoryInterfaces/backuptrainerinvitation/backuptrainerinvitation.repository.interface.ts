import { IBackupTrainerInvitationEntity } from "@/entities/models/backuptrainerinvitation.entity";
import { BackupInvitationStatus } from "@/shared/constants";
import { IBaseRepository } from "../base-repository.interface";

export interface IBackupTrainerInvitationRepository
  extends IBaseRepository<IBackupTrainerInvitationEntity> {
  findByClientId(clientId: string): Promise<IBackupTrainerInvitationEntity[]>;
  findPendingByClientId(
    clientId: string
  ): Promise<IBackupTrainerInvitationEntity[]>;
  updateStatus(
    id: string,
    status: BackupInvitationStatus,
    respondedAt?: Date
  ): Promise<IBackupTrainerInvitationEntity | null>;
  findExpiredInvitations(): Promise<IBackupTrainerInvitationEntity[]>;
  updateManyStatusByClientIdExcept(
    clientId: string,
    excludeInvitationId: string,
    status: BackupInvitationStatus,
    updatedAt: Date
  ): Promise<void>;
    findByClientIdAndStatus(clientId: string, status: BackupInvitationStatus): Promise<IBackupTrainerInvitationEntity[]>;
}
