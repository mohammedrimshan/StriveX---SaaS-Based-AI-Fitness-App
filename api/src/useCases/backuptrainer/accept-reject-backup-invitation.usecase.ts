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
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (action === "accept") {
      // 1. Attempt atomic update to assign backup trainer only if none assigned yet
      const updatedClient = await this.clientRepository.updateBackupTrainerIfNotAssigned(
        client.clientId,
        trainerId,
        BackupInvitationStatus.ACCEPTED
      );

      if (!updatedClient) {
        // Someone else already accepted first
        throw new CustomError(
          "Backup trainer already assigned to another trainer",
          HTTP_STATUS.CONFLICT
        );
      }

      // 2. Mark this invitation as ACCEPTED
      await this.invitationRepository.updateStatus(invitationId, BackupInvitationStatus.ACCEPTED, new Date());

      // 3. Add client to trainer's backupClientIds
      const updatedTrainer = await this.trainerRepository.addBackupClient(trainerId, client.id!);
      if (!updatedTrainer) {
        throw new CustomError("Failed to update trainer backup clients", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      // 4. Reject other pending invitations in bulk
      await this.invitationRepository.updateManyStatusByClientIdExcept(
        client.clientId,
        invitationId,
        BackupInvitationStatus.REJECTED,
        new Date()
      );

      // 5. Notify rejected trainers about rejection
      // Fetch the rejected invitations to notify trainers
      const rejectedInvitations = await this.invitationRepository.findByClientIdAndStatus(
        client.clientId,
        BackupInvitationStatus.REJECTED
      );

      for (const invite of rejectedInvitations) {
        if (invite.id !== invitationId) {
          await this.notificationService.sendToUser(
            invite.trainerId,
            "Backup Invitation Expired",
            `Your backup trainer invitation for ${client.firstName} ${client.lastName} was not selected.`,
            "INFO"
          );
        }
      }

      // 6. Notify client about the assigned backup trainer
      await this.notificationService.sendToUser(
        client.id!,
        "Backup Trainer Assigned",
        `Trainer ${trainer.firstName} ${trainer.lastName} has been assigned as your backup trainer.`,
        "SUCCESS"
      );

      return updatedClient;
    } else {
      // Reject case: mark invitation as REJECTED
      await this.invitationRepository.updateStatus(invitationId, BackupInvitationStatus.REJECTED, new Date());

      await this.notificationService.sendToUser(
        client.id!,
        "Backup Trainer Invitation Rejected",
        `Trainer ${trainer.firstName} ${trainer.lastName} has declined your backup trainer invitation.`,
        "ERROR"
      );

      return client;
    }
  }
}
