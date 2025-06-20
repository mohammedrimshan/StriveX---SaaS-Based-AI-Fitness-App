import { inject, injectable } from "tsyringe";
import { ITrainerAcceptRejectRequestUseCase } from "@/entities/useCaseInterfaces/trainer/trainer-accept-reject-request-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IEmailService } from "@/entities/services/email-service.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  TrainerSelectionStatus,
  TrainerApprovalStatus,
  TRAINER_ACCEPTANCE_MAIL_CONTENT,
  TRAINER_REJECTION_MAIL_CONTENT,
  PaymentStatus,
} from "@/shared/constants";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";

@injectable()
export class TrainerAcceptRejectRequestUseCase
  implements ITrainerAcceptRejectRequestUseCase
{
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IPaymentRepository") private _paymentRepository: IPaymentRepository,
    @inject("ISlotRepository") private _slotRepository: ISlotRepository,
    @inject('NotificationService') private _notificationService: NotificationService
  ) {}

  async execute(
    trainerId: string,
    clientId: string,
    action: "accept" | "reject",
    rejectionReason?: string
  ): Promise<IClientEntity> {
    const client =
      (await this._clientRepository.findById(clientId)) ||
      (await this._clientRepository.findByClientNewId(clientId));
    if (!client) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (!client.isPremium || !client.subscriptionEndDate || client.subscriptionEndDate < new Date()) {
      throw new CustomError("Active premium subscription required", HTTP_STATUS.FORBIDDEN);
    }

    const trainer = await this._trainerRepository.findById(trainerId);
    if (!trainer || trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (!client.selectedTrainerId || client.selectedTrainerId !== trainerId) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_NOT_ASSIGNED_TO_CLIENT,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!trainer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainer.email)) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_TRAINER_EMAIL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    const clientName = `${client.firstName} ${client.lastName}`;
    const trainerName = `${trainer.firstName} ${trainer.lastName}`;
    const internalClientId = client.id;

    if (action === "accept") {
      if (client.selectStatus !== TrainerSelectionStatus.PENDING) {
        throw new CustomError(
          ERROR_MESSAGES.REQUEST_NOT_PENDING,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._trainerRepository.update(trainerId, {
        clientCount: (trainer.clientCount ?? 0) + 1,
      });

      const updatedClient = await this._clientRepository.update(clientId, {
        selectStatus: TrainerSelectionStatus.ACCEPTED,
      });

      if (!updatedClient) {
        throw new CustomError(
          ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }

      const payments = await this._paymentRepository.find(
        {
          clientId: internalClientId,
          status: PaymentStatus.COMPLETED,
          $or: [{ trainerId: null }, { trainerId: { $exists: false } }],
        },
        0,
        1000
      );

      if (payments.items.length > 0) {
        await this._paymentRepository.updateMany(
          {
            clientId: internalClientId,
            status: PaymentStatus.COMPLETED,
            $or: [{ trainerId: null }, { trainerId: { $exists: false } }],
          },
          { trainerId, updatedAt: new Date() }
        );
      }

      try {
        const emailContent = TRAINER_ACCEPTANCE_MAIL_CONTENT(
          trainerName,
          clientName
        );
        await this._emailService.sendEmail(
          client.email,
          "New Client Assignment",
          emailContent
        );
      } catch (error: any) {}

      if (client.isPremium) {
        const backupTrainer = await this._trainerRepository.findBackupTrainerForClient(clientId,trainerId)
        if (backupTrainer) {
          // Update all future slots for this client
          const slots = await this._slotRepository.findBookedSlotsByClientId(clientId);
          for (const slot of slots) {
            await this._slotRepository.update(slot.id!, { backupTrainerId: backupTrainer.id });
          }

          // Notify client and backup trainer
          const clientName = `${client.firstName} ${client.lastName}`;
          const backupTrainerName = `${backupTrainer.firstName} ${backupTrainer.lastName}`;
          await this._notificationService.sendToUser(
            clientId,
            "Backup Trainer Assigned",
            `A backup trainer, ${backupTrainerName}, has been assigned to your sessions.`,
            "INFO"
          );
          await this._notificationService.sendToUser(
            backupTrainer.id!,
            "Assigned as Backup Trainer",
            `You have been assigned as a backup trainer for ${clientName}.`,
            "INFO"
          );
        }
      }

      return updatedClient;
    }

    if (action === "reject") {
      const updatedClient = await this._clientRepository.updateByClientId(
        clientId,
        {
          selectStatus: TrainerSelectionStatus.REJECTED,
          selectedTrainerId: undefined,
        }
      );

      if (!updatedClient) {
        throw new CustomError(
          ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }

      try {
        const emailContent = TRAINER_REJECTION_MAIL_CONTENT(
          trainerName,
          clientName,
          rejectionReason ?? "No reason provided."
        );
        await this._emailService.sendEmail(
          client.email,
          "Client Request Rejected",
          emailContent
        );
      } catch (error: any) {}

      return updatedClient;
    }

    throw new CustomError(
      ERROR_MESSAGES.INVALID_ACTION,
      HTTP_STATUS.BAD_REQUEST
    );
  }
}
