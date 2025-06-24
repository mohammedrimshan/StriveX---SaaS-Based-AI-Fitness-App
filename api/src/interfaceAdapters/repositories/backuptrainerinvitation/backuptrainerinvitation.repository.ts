import { injectable } from "tsyringe";
import { IBackupTrainerInvitationEntity } from "@/entities/models/backuptrainerinvitation.entity";
import { IBackupTrainerInvitationRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/backuptrainerinvitation.repository.interface";
import { BackupTrainerInvitationModel } from "@/frameworks/database/mongoDB/models/backuptrainerinvitation.model";
import { BaseRepository } from "../base.repository";
import { BackupInvitationStatus } from "@/shared/constants";

@injectable()
export class BackupTrainerInvitationRepository
  extends BaseRepository<IBackupTrainerInvitationEntity>
  implements IBackupTrainerInvitationRepository
{
  constructor() {
    super(BackupTrainerInvitationModel);
  }

  async findByClientId(
    clientId: string
  ): Promise<IBackupTrainerInvitationEntity[]> {
    const invitations = await this.model.find({ clientId }).lean();
    return invitations.map((inv) => this.mapToEntity(inv));
  }

  async findPendingByClientId(
    clientId: string
  ): Promise<IBackupTrainerInvitationEntity[]> {
    const invitations = await this.model
      .find({
        clientId,
        status: BackupInvitationStatus.PENDING,
        expiresAt: { $gt: new Date() },
      })
      .lean();
    return invitations.map((inv) => this.mapToEntity(inv));
  }

  async updateStatus(
    id: string,
    status: BackupInvitationStatus,
    respondedAt?: Date
  ): Promise<IBackupTrainerInvitationEntity | null> {
    const updates: Partial<IBackupTrainerInvitationEntity> = { status };
    if (respondedAt) updates.respondedAt = respondedAt;
    return this.findOneAndUpdateAndMap({ _id: id }, updates);
  }

  async findExpiredInvitations(): Promise<IBackupTrainerInvitationEntity[]> {
    const invitations = await this.model
      .find({
        status: BackupInvitationStatus.PENDING,
        expiresAt: { $lte: new Date() },
      })
      .lean();
    return invitations.map((inv) => this.mapToEntity(inv));
  }
  async updateManyStatusByClientIdExcept(
    clientId: string,
    excludeInvitationId: string,
    status: BackupInvitationStatus,
    updatedAt: Date
  ): Promise<void> {
    await this.model.updateMany(
      {
        clientId,
        _id: { $ne: excludeInvitationId },
        status: BackupInvitationStatus.PENDING,
      },
      {
        $set: {
          status,
          updatedAt,
        },
      }
    );
  }
  async findByClientIdAndStatus(
    clientId: string,
    status: BackupInvitationStatus
  ): Promise<IBackupTrainerInvitationEntity[]> {
    return this.model.find({ clientId, status }).exec();
  }
}
