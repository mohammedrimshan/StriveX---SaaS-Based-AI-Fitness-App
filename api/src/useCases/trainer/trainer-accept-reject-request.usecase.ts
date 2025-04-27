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
  SUCCESS_MESSAGES,
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
    console.log(`Executing with trainerId: ${trainerId}, clientId: ${clientId}, action: ${action}`);

    // Validate client
    const client = await this._clientRepository.findByClientId(clientId);
    console.log("Client found:", client);
    if (!client) {
      throw new CustomError("Client not found for the provided clientId", HTTP_STATUS.NOT_FOUND);
    }

    // Validate trainer
    const trainer = await this._trainerRepository.findById(trainerId);
    if (!trainer || trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if the trainer is matched with the client
    if (!client.selectedTrainerId || client.selectedTrainerId !== trainerId) {
      throw new CustomError("Trainer is not assigned to this client", HTTP_STATUS.BAD_REQUEST);
    }

    // Validate trainer email
    if (!trainer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainer.email)) {
      console.error("Invalid or missing trainer email:", trainer);
      throw new CustomError("Invalid trainer email", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Handle accept action
    if (action === "accept") {
      if (client.selectStatus !== TrainerSelectionStatus.PENDING) {
        throw new CustomError("Client request is not in pending status", HTTP_STATUS.BAD_REQUEST);
      }
      const updates: Partial<IClientEntity> = {
        selectStatus: TrainerSelectionStatus.ACCEPTED,
      };
      await this._trainerRepository.update(trainerId, {
        clientCount: (trainer.clientCount ?? 0) + 1,
      });
      const updatedClient = await this._clientRepository.updateByClientId(clientId, updates);
      if (!updatedClient) {
        throw new CustomError(ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      // Send acceptance email
      const clientName = `${client.firstName} ${client.lastName}`;
      const trainerName = `${trainer.firstName} ${trainer.lastName}`;
      console.log(clientName,"Client Name")
      console.log(trainerName,"Trainer Name")
      const emailContent = TRAINER_ACCEPTANCE_MAIL_CONTENT(trainerName, clientName);
      console.log("Sending acceptance email:", {
        trainerEmail: client.email,
        subject: "New Client Assignment",
        emailContent,
      });
      try {
        await this._emailService.sendEmail(
          client.email,
          "New Client Assignment",
          emailContent
        );
        console.log(`Successfully sent acceptance email to ${client.email}`);
      } catch (error: any) {
        console.error("Failed to send acceptance email:", {
          error: error.message,
          stack: error.stack,
          trainerEmail: client.email,
          clientName,
          trainerName,
          emailContent,
        });
        // Continue execution to avoid blocking client update
      }

      return updatedClient;
    }

    // Handle reject action
    if (action === "reject") {
      if (!rejectionReason) {
        throw new CustomError("Rejection reason is required", HTTP_STATUS.BAD_REQUEST);
      }
      const updates: Partial<IClientEntity> = {
        selectStatus: TrainerSelectionStatus.REJECTED,
        selectedTrainerId: undefined,
      };
      const updatedClient = await this._clientRepository.updateByClientId(clientId, updates);
      if (!updatedClient) {
        throw new CustomError(ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      // Send rejection email
      const clientName = `${client.firstName} ${client.lastName}`;
      const trainerName = `${trainer.firstName} ${trainer.lastName}`;
      const emailContent = TRAINER_REJECTION_MAIL_CONTENT(trainerName, clientName, rejectionReason);
      console.log("Sending rejection email:", {
        clientEmail: client.email,
        subject: "Client Request Rejected",
        emailContent,
      });
      try {
        await this._emailService.sendEmail(
          client.email,
          "Client Request Rejected",
          emailContent
        );
        console.log(`Successfully sent rejection email to ${trainer.email}`);
      } catch (error: any) {
        console.error("Failed to send rejection email:", {
          error: error.message,
          stack: error.stack,
          clientEmail: client.email,
          clientName,
          trainerName,
          emailContent,
          rejectionReason,
        });
      }

      return updatedClient;
    }

    throw new CustomError("Invalid action", HTTP_STATUS.BAD_REQUEST);
  }
}