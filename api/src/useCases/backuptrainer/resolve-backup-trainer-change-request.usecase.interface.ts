import { inject, injectable } from "tsyringe";
import mongoose from "mongoose";
import { IResolveBackupTrainerChangeRequestUseCase } from "@/entities/useCaseInterfaces/backtrainer/resolve-backup-trainer-change-request.usecase";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ITrainerChangeRequestRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/trainerchangerequest.repository.interface";
import { INotificationRepository } from "@/entities/repositoryInterfaces/notification/notification-repository.interface";
import { IAssignBackupTrainerUseCase } from "@/entities/useCaseInterfaces/backtrainer/assign-backup-trainer.usecase.interface";
import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";
import { CustomError } from "@/entities/utils/custom.error";
import {
  TrainerChangeRequestStatus,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "@/shared/constants";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";

@injectable()
export class ResolveBackupTrainerChangeRequestUseCase
  implements IResolveBackupTrainerChangeRequestUseCase
{
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("ITrainerChangeRequestRepository") private changeRequestRepository: ITrainerChangeRequestRepository,
    @inject("INotificationRepository") private notificationRepository: INotificationRepository,
    @inject("IAssignBackupTrainerUseCase") private assignBackupTrainerUseCase: IAssignBackupTrainerUseCase,
    @inject("NotificationService") private notificationService: NotificationService
  ) {}

  async execute(
    requestId: string,
    adminId: string,
    action: "approve" | "reject"
  ): Promise<ITrainerChangeRequestEntity> {
    const request = await this.changeRequestRepository.findById(requestId);
    if (!request) {
      throw new CustomError(ERROR_MESSAGES.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (request.status !== TrainerChangeRequestStatus.PENDING) {
      throw new CustomError("Request is not pending", HTTP_STATUS.BAD_REQUEST);
    }

    const clientId = request.clientId;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      throw new CustomError("Invalid client ID format", HTTP_STATUS.BAD_REQUEST);
    }

    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (action === "approve") {
      await this.handleApproval(request, client.id!);
    }

    const updatedStatus = action === "approve" 
      ? TrainerChangeRequestStatus.APPROVED 
      : TrainerChangeRequestStatus.REJECTED;

    const updatedRequest = await this.changeRequestRepository.updateStatus(
      requestId,
      updatedStatus,
      adminId
    );

    if (!updatedRequest) {
      throw new CustomError("Failed to update change request", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const notificationType = action === "approve" ? "SUCCESS" : "ERROR";
    const statusText = action === "approve" ? "Approved" : "Rejected";

    await this.notificationService.sendToUser(
      client.id!,
      `Backup Trainer ${request.requestType} Request ${statusText}`,
      `Your request to ${request.requestType.toLowerCase()} your backup trainer has been ${statusText.toLowerCase()}.`,
      notificationType
    );

    return updatedRequest;
  }

  private async handleApproval(request: ITrainerChangeRequestEntity, clientId: string) {
    if (request.requestType === "REVOKE") {
      await this.clientRepository.clearBackupTrainer(clientId);
      await this.trainerRepository.removeBackupClient(request.backupTrainerId, clientId);
    } else if (request.requestType === "CHANGE") {
      await this.trainerRepository.removeBackupClient(request.backupTrainerId, clientId);
      await this.assignBackupTrainerUseCase.execute(clientId);
    }
  }
}
