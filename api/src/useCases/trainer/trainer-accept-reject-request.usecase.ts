import { inject, injectable } from "tsyringe";
import { ITrainerAcceptRejectRequestUseCase } from "@/entities/useCaseInterfaces/trainer/trainer-accept-reject-request-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IEmailService } from "@/entities/services/email-service.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  TrainerSelectionStatus,
  TrainerApprovalStatus,
  TRAINER_ACCEPTANCE_MAIL_CONTENT,
  TRAINER_REJECTION_MAIL_CONTENT,
} from "@/shared/constants";

@injectable()
export class TrainerAcceptRejectRequestUseCase implements ITrainerAcceptRejectRequestUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository,
    @inject("IEmailService") private _emailService: IEmailService
  ) {}

  async execute(
    trainerId: string,
    clientId: string,
    action: "accept" | "reject",
    rejectionReason?: string
  ): Promise<IClientEntity> {
    const client = await this._clientRepository.findByClientId(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const trainer = await this._trainerRepository.findById(trainerId);
    if (!trainer || trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!client.selectedTrainerId || client.selectedTrainerId !== trainerId) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_ASSIGNED_TO_CLIENT, HTTP_STATUS.BAD_REQUEST);
    }

    if (!trainer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainer.email)) {
      throw new CustomError(ERROR_MESSAGES.INVALID_TRAINER_EMAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const clientName = `${client.firstName} ${client.lastName}`;
    const trainerName = `${trainer.firstName} ${trainer.lastName}`;

    if (action === "accept") {
      if (client.selectStatus !== TrainerSelectionStatus.PENDING) {
        throw new CustomError(ERROR_MESSAGES.REQUEST_NOT_PENDING, HTTP_STATUS.BAD_REQUEST);
      }

      await this._trainerRepository.update(trainerId, {
        clientCount: (trainer.clientCount ?? 0) + 1,
      });

      const updatedClient = await this._clientRepository.updateByClientId(clientId, {
        selectStatus: TrainerSelectionStatus.ACCEPTED,
      });

      if (!updatedClient) {
        throw new CustomError(ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      try {
        const emailContent = TRAINER_ACCEPTANCE_MAIL_CONTENT(trainerName, clientName);
        await this._emailService.sendEmail(client.email, "New Client Assignment", emailContent);
      } catch (error: any) {
        console.error("Failed to send acceptance email:", error.message);
      }

      return updatedClient;
    }

    if (action === "reject") {
      const updatedClient = await this._clientRepository.updateByClientId(clientId, {
        selectStatus: TrainerSelectionStatus.REJECTED,
        selectedTrainerId: undefined,
      });

      if (!updatedClient) {
        throw new CustomError(ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      try {
        const emailContent = TRAINER_REJECTION_MAIL_CONTENT(
          trainerName,
          clientName,
          rejectionReason ?? "No reason provided."
        );
        await this._emailService.sendEmail(client.email, "Client Request Rejected", emailContent);
      } catch (error: any) {
        console.error("Failed to send rejection email:", error.message);
      }

      return updatedClient;
    }

    throw new CustomError(ERROR_MESSAGES.INVALID_ACTION, HTTP_STATUS.BAD_REQUEST);
  }
}
