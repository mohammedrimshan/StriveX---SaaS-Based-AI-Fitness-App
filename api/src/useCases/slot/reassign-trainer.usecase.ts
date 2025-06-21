import { inject, injectable } from "tsyringe";
import { IReassignTrainerUseCase } from "@/entities/useCaseInterfaces/slot/reassign-trainer-usecase.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, TrainerApprovalStatus } from "@/shared/constants";
import { ISlotEntity } from "@/entities/models/slot.entity";

@injectable()
export class ReassignTrainerUseCase implements IReassignTrainerUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("NotificationService")
    private notificationService: NotificationService
  ) {}

  async execute(slotId: string, reason: string): Promise<ISlotEntity> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }

    const client = await this.clientRepository.findByClientNewId(
      slot.clientId!
    );
    if (!client) {
      throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check for backup trainer first
    let newTrainerId = slot.backupTrainerId;
    if (!newTrainerId) {
      const newTrainer =
        await this.trainerRepository.findBackupTrainerForClient(
          typeof client?.id === "string"
            ? client.clientId
            : client.clientId.toString(),
          typeof slot.trainerId === "string"
            ? slot.trainerId
            : slot.trainerId.toString()
        );

      if (!newTrainer) {
        throw new CustomError(
          "No available trainers found",
          HTTP_STATUS.NOT_FOUND
        );
      }
      newTrainerId = newTrainer.id!;
    }

    const previousTrainerId = slot.previousTrainerId || [];
    previousTrainerId.push(slot.trainerId);

    const updatedSlot = await this.slotRepository.update(slotId, {
      trainerId: newTrainerId,
      previousTrainerId,
      cancellationReason: reason,
    });

    if (!updatedSlot) {
      throw new CustomError(
        "Failed to reassign trainer",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Notify client and new trainer
    const clientName = `${client.firstName} ${client.lastName}`;
    const newTrainer = await this.trainerRepository.findById(
      newTrainerId.toString()
    );
    if (newTrainer) {
      const trainerName = `${newTrainer.firstName} ${newTrainer.lastName}`;
      await this.notificationService.sendToUser(
        client.id!,
        "Trainer Reassigned",
        `Your session has been reassigned to ${trainerName} due to: ${reason}`,
        "INFO"
      );
      await this.notificationService.sendToUser(
        newTrainerId.toString(),
        "New Session Assigned",
        `You have been assigned a session with ${clientName} due to: ${reason}`,
        "INFO"
      );
    }

    return updatedSlot;
  }
}
