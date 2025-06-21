import { inject, injectable } from "tsyringe";
import { IAcceptRejectBackupInvitationUseCase } from "@/entities/useCaseInterfaces/backtrainer/accept-reject-backup-invitation.usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IBackupTrainerInvitationRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/backuptrainerinvitation.repository.interface";
import { INotificationRepository } from "@/entities/repositoryInterfaces/notification/notification-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  BackupInvitationStatus,
  HTTP_STATUS,
  ERROR_MESSAGES
} from "@/shared/constants";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { IClientEntity } from "@/entities/models/client.entity";

@injectable()
export class AcceptRejectBackupInvitationUseCase
  implements IAcceptRejectBackupInvitationUseCase
{
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IBackupTrainerInvitationRepository") private invitationRepository: IBackupTrainerInvitationRepository,
    @inject("INotificationRepository") private notificationRepository: INotificationRepository,
    @inject("NotificationService") private notificationService: NotificationService
  ) {}

  async execute(
    invitationId: string,
    trainerId: string, // MongoDB _id of the trainer
    action: "accept" | "reject"
  ): Promise<IClientEntity> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation || invitation.trainerId !== trainerId) {
      throw new CustomError(ERROR_MESSAGES.INVITATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (
      invitation.status !== BackupInvitationStatus.PENDING ||
      invitation.expiresAt <= new Date()
    ) {
      throw new CustomError("Invitation is not pending or has expired", HTTP_STATUS.BAD_REQUEST);
    }

    const client = await this.clientRepository.findById(invitation.clientId);
    console.log(invitation.clientId,"TO KNOW CLIENT ID");
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (action === "accept") {
      console.log("[ACCEPT] Updating invitation status...");
      await this.invitationRepository.updateStatus(invitationId, BackupInvitationStatus.ACCEPTED, new Date());

      console.log("[ACCEPT] Updating client backup trainer...");
      await this.clientRepository.updateBackupTrainer(
        client.clientId,
        trainerId,
        BackupInvitationStatus.ACCEPTED
      );

      console.log(`[ACCEPT] Adding client ${client.id} to trainer ${trainerId}'s backupClientIds`);
      const updatedTrainer = await this.trainerRepository.addBackupClient(
        trainerId,
        client.id!
      );

      if (!updatedTrainer) {
        console.error(`[ERROR] Failed to update trainer ${trainerId}`);
        throw new CustomError("Failed to update trainer backup clients", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      console.log("[ACCEPT] Cancelling other invitations...");
      const pendingInvites = await this.invitationRepository.findPendingByClientId(client.clientId);
      for (const invite of pendingInvites) {
        if (invite.id !== invitationId) {
          await this.invitationRepository.updateStatus(invite.id, BackupInvitationStatus.REJECTED, new Date());
        }
      }

      // Notify client
      await this.notificationRepository.save({
        userId: client.clientId,
        title: "Backup Trainer Assigned",
        message: `Trainer ${trainer.firstName} ${trainer.lastName} has been assigned as your backup trainer.`,
        type: "SUCCESS"
      });

      await this.notificationService.sendToUser(
        client.id!,
        "Backup Trainer Assigned",
        `Trainer ${trainer.firstName} ${trainer.lastName} has been assigned as your backup trainer.`,
        "SUCCESS"
      );

      console.log(`[SUCCESS] Trainer ${trainerId} now has backupClientIds:`, updatedTrainer.backupClientIds);
    } else {
      // Reject case
      await this.invitationRepository.updateStatus(invitationId, BackupInvitationStatus.REJECTED, new Date());
      await this.notificationRepository.save({
        userId: client.clientId,
        title: "Backup Trainer Invitation Rejected",
        message: `Trainer ${trainer.firstName} ${trainer.lastName} has declined your backup trainer invitation.`,
        type: "INFO"
      });

      console.log(`[REJECT] Trainer ${trainerId} rejected the backup invitation.`);
    }

    return client;
  }
}
