
import { inject, injectable } from "tsyringe";
import { IAssignBackupTrainerUseCase } from "@/entities/useCaseInterfaces/backtrainer/assign-backup-trainer.usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IBackupTrainerInvitationRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/backuptrainerinvitation.repository.interface";
import { INotificationRepository } from "@/entities/repositoryInterfaces/notification/notification-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { BackupInvitationStatus, HTTP_STATUS, ERROR_MESSAGES, TrainerSelectionStatus } from "@/shared/constants";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { IBackupTrainerInvitationEntity } from "@/entities/models/backuptrainerinvitation.entity";
import mongoose, { Types } from "mongoose";

@injectable()
export class AssignBackupTrainerUseCase implements IAssignBackupTrainerUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IBackupTrainerInvitationRepository") private invitationRepository: IBackupTrainerInvitationRepository,
    @inject("INotificationRepository") private notificationRepository: INotificationRepository,
    @inject("NotificationService") private notificationService: NotificationService
  ) {}

 async execute(clientId: string): Promise<IClientEntity> {
  const client = await this.clientRepository.findById(clientId);
  if (!client) {
    throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (!client.selectedTrainerId || client.selectStatus !== TrainerSelectionStatus.ACCEPTED) {
    throw new CustomError("Primary trainer must be accepted before assigning backup", HTTP_STATUS.BAD_REQUEST);
  }

  // Convert to ObjectId[]
  const excludedTrainerIds: Types.ObjectId[] = [
    new mongoose.Types.ObjectId(client.selectedTrainerId),
    ...(client.backupTrainerId ? [new mongoose.Types.ObjectId(client.backupTrainerId)] : [])
  ];

  console.log("Excluded trainer ids:", excludedTrainerIds);

  const trainers = await this.trainerRepository.findAvailableBackupTrainers(client, excludedTrainerIds);
  if (!trainers.length) {
    throw new CustomError("No available backup trainers found", HTTP_STATUS.NOT_FOUND);
  }

  const topTrainers = trainers.slice(0, 3);
  console.log("Who is top 3 trainers:", topTrainers);

  const invitationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  for (const trainer of topTrainers) {
    const invitation: Partial<IBackupTrainerInvitationEntity> = {
      clientId,
      trainerId: trainer.id,
      status: BackupInvitationStatus.PENDING,
      expiresAt: invitationExpiry
    };

    await this.invitationRepository.save(invitation);

    await this.notificationService.sendToUser(
      trainer.id!,
      "Backup Trainer Invitation",
      `You have been invited to be a backup trainer for ${client.firstName} ${client.lastName}.`,
      "SUCCESS"
    );
  }

  return client;
}

}
