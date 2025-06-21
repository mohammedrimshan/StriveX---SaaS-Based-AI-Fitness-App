import { inject, injectable } from "tsyringe";
import { IHandleExpiredInvitationsUseCase } from "@/entities/useCaseInterfaces/backtrainer/handle-expired-invitations.usecaseinterface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IBackupTrainerInvitationRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/backuptrainerinvitation.repository.interface";
import { INotificationRepository } from "@/entities/repositoryInterfaces/notification/notification-repository.interface";
import { BackupInvitationStatus } from "@/shared/constants";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import mongoose, { Types } from "mongoose";

@injectable()
export class HandleExpiredInvitationsUseCase implements IHandleExpiredInvitationsUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IBackupTrainerInvitationRepository") private invitationRepository: IBackupTrainerInvitationRepository,
    @inject("INotificationRepository") private notificationRepository: INotificationRepository,
    @inject("NotificationService") private notificationService: NotificationService
  ) {}

  async execute(): Promise<void> {
    const expiredInvitations = await this.invitationRepository.findExpiredInvitations();
    for (const invitation of expiredInvitations) {
      const client = await this.clientRepository.findByClientId(invitation.clientId);
      if (!client) continue;

      // Check if a backup trainer is already assigned
      if (client.backupTrainerId && client.backupTrainerStatus === BackupInvitationStatus.ACCEPTED) {
        await this.invitationRepository.updateStatus(invitation.id, BackupInvitationStatus.REJECTED);
        continue;
      }

      // Find a random available trainer
     const excludedTrainerIds: Types.ObjectId[] = [client.selectedTrainerId, client.backupTrainerId]
  .filter((id): id is string => typeof id === "string")
  .map(id => new mongoose.Types.ObjectId(id));
      const trainers = await this.trainerRepository.findAvailableBackupTrainers(client, excludedTrainerIds);
      if (!trainers.length) {
        await this.notificationRepository.save({
          userId: client.clientId,
          title: "Backup Trainer Assignment Failed",
          message: "No available backup trainers found. Please contact support.",
          type: "ERROR"
        });
        continue;
      }

      const randomTrainer = trainers[Math.floor(Math.random() * trainers.length)];

      // Assign as fallback
      await this.invitationRepository.save({
        clientId: client.clientId,
        trainerId: randomTrainer.clientId,
        status: BackupInvitationStatus.AUTO_ASSIGNED,
        isFallback: true,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours for opt-out
      });

      // Update client and trainer
      await this.clientRepository.updateBackupTrainer(client.clientId, randomTrainer.clientId, BackupInvitationStatus.AUTO_ASSIGNED);
      await this.trainerRepository.addBackupClient(randomTrainer.clientId, client.clientId);

      // Notify trainer
      await this.notificationRepository.save({
        userId: randomTrainer.clientId,
        title: "Backup Trainer Auto-Assigned",
        message: `You have been auto-assigned as a backup trainer for ${client.firstName} ${client.lastName}. You can opt out within 12 hours.`,
        type: "INFO",
        actionLink: `/trainer/invitations/${invitation.id}/reject`
      });

      await this.notificationService.sendToUser(
        randomTrainer.id!,
        "Backup Trainer Auto-Assigned",
        `You have been auto-assigned as a backup trainer for ${client.firstName} ${client.lastName}.`,
        "INFO"
      );

      // Notify client
      await this.notificationRepository.save({
        userId: client.clientId,
        title: "Backup Trainer Auto-Assigned",
        message: `Trainer ${randomTrainer.firstName} ${randomTrainer.lastName} has been auto-assigned as your backup trainer.`,
        type: "SUCCESS"
      });
    }
  }
}