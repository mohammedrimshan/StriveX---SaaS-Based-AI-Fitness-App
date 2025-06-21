import { inject, injectable } from "tsyringe";
import { IRequestBackupTrainerChangeUseCase } from "@/entities/useCaseInterfaces/backtrainer/request-backup-trainer-change.usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerChangeRequestRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/trainerchangerequest.repository.interface";
import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";
import { CustomError } from "@/entities/utils/custom.error";
import {
  TrainerChangeRequestStatus,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "@/shared/constants";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";

@injectable()
export class RequestBackupTrainerChangeUseCase implements IRequestBackupTrainerChangeUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerChangeRequestRepository") private changeRequestRepository: ITrainerChangeRequestRepository,
    @inject("NotificationService") private notificationService: NotificationService,
    @inject("IAdminRepository") private adminRepository: IAdminRepository
  ) {}

  async execute(clientId: string, requestType: "CHANGE" | "REVOKE", reason?: string): Promise<ITrainerChangeRequestEntity> {
    if (!reason || !reason.trim()) {
      throw new CustomError(`Reason is required for ${requestType} requests`, HTTP_STATUS.BAD_REQUEST);
    }

    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!client.backupTrainerId || !client.backupTrainerStatus) {
      throw new CustomError("No backup trainer assigned", HTTP_STATUS.BAD_REQUEST);
    }

    const existingRequests = await this.changeRequestRepository.findByClientId(clientId);
    if (existingRequests.some((req: any) => req.status === TrainerChangeRequestStatus.PENDING)) {
      throw new CustomError("A pending change request already exists", HTTP_STATUS.BAD_REQUEST);
    }

    const changeRequest: Partial<ITrainerChangeRequestEntity> = {
      clientId,
      backupTrainerId: client.backupTrainerId,
      requestType,
      reason,
      status: TrainerChangeRequestStatus.PENDING,
    };

    const savedRequest = await this.changeRequestRepository.save(changeRequest);
    const requestId = (savedRequest as any).id?.toString();

    // Notify client
    await this.notificationService.sendToUser(
      client.id!,
      `Backup Trainer ${requestType} Request`,
      `Your request to ${requestType.toLowerCase()} your backup trainer is pending review.\nReason: ${reason}`,
      "WARNING"
    );

    // Fetch admins
    const { items: admins } = await this.adminRepository.find({ role: "admin" }, 0, 1000);
    if (!admins?.length) {
      throw new CustomError("Admin not found", HTTP_STATUS.NOT_FOUND);
    }

    const adminMessage = `Client ${client.firstName} ${client.lastName} has requested to ${requestType.toLowerCase()} their backup trainer.`;

    await Promise.all(
      admins.map(async (admin) => {
        try {
          await this.notificationService.sendToUser(
            admin.id!,
            `New Backup Trainer Change Request\nReason: ${reason}`,
            adminMessage,
            "INFO",
            `/admin/change-requests/${requestId}`,
            requestId
          );
        } catch (err) {
          console.error(`Failed to notify admin ${admin.id}:`, err);
        }
      })
    );

    return savedRequest;
  }
}
