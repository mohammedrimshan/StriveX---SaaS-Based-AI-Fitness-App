import { inject, injectable } from "tsyringe";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  TrainerSelectionStatus,
} from "../../shared/constants";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";

@injectable()
export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository,
    @inject("NotificationService")
    private notificationService: NotificationService
  ) {}

  async execute(userType: string, userId: string): Promise<void> {
    if (userType === "client") {
      const user = await this._clientRepository.findById(userId);
      if (!user) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      const newStatus = user.status === "active" ? "blocked" : "active";
      await this._clientRepository.findByIdAndUpdate(userId, {
        status: newStatus,
      });
    } else if (userType === "trainer") {
      const trainer = await this._trainerRepository.findById(userId);
      if (!trainer) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      const newStatus = trainer.status === "active" ? "blocked" : "active";
      await this._trainerRepository.findByIdAndUpdate(userId, {
        status: newStatus,
      });

      if (newStatus === "blocked") {
        const affectedClients =
          await this._clientRepository.findClientsBySelectedTrainerId(userId);

        for (const client of affectedClients) {
          if (client.backupTrainerId) {
            await this._clientRepository.findByIdAndUpdate(client.id, {
              previousTrainerId: client.selectedTrainerId, 
              selectedTrainerId: client.backupTrainerId,
              backupTrainerId: null,
              selectStatus: TrainerSelectionStatus.ACCEPTED,
            });

            await this.notificationService.sendToUser(
              client.id!,
              "Trainer Blocked",
              `Your primary trainer was blocked. Your backup trainer has been assigned as your main trainer.`,
              "INFO"
            );
          } else {
            await this.notificationService.sendToUser(
              client.id!,
              "Trainer Blocked",
              `Your primary trainer was blocked. Please choose a new trainer manually.`,
              "WARNING"
            );
          }
        }
      }

      if (newStatus === "active") {
        const clientsToRestore =
          await this._clientRepository.findClientsByPreviousTrainerId(userId);

        for (const client of clientsToRestore) {
          await this._clientRepository.updateRaw(client.id!, {
            $set: {
              selectedTrainerId: userId,
              backupTrainerId: client.selectedTrainerId,
              selectStatus: TrainerSelectionStatus.ACCEPTED,
            },
            $unset: {
              previousTrainerId: "",
            },
          });

          await this.notificationService.sendToUser(
            client.id!,
            "Trainer Reactivated",
            `Your original trainer is now active again and has been reassigned to you.`,
            "SUCCESS"
          );
        }
      }
    }
  }
}
