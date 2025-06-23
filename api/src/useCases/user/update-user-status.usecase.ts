import { inject, injectable } from "tsyringe";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SlotStatus,
  TrainerSelectionStatus,
} from "../../shared/constants";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { ICancellationRepository } from "@/entities/repositoryInterfaces/slot/cancellation.repository.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { ICancellationEntity } from "@/entities/models/cancellation.entity";
import { format } from "date-fns";

@injectable()
export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository,
    @inject("ISlotRepository") private _slotRepository: ISlotRepository,
    @inject("ICancellationRepository")
    private _cancellationRepository: ICancellationRepository,
    @inject("NotificationService")
    private notificationService: NotificationService
  ) {}

  async execute(userType: string, userId: string): Promise<void> {
    if (userType === "client") {
      await this.handleClientStatusUpdate(userId);
    } else if (userType === "trainer") {
      await this.handleTrainerStatusUpdate(userId);
    } else {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_ROLE,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  private async handleClientStatusUpdate(userId: string): Promise<void> {
    const user = await this._clientRepository.findByClientNewId(userId);
    if (!user) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const newStatus = user.status === "active" ? "blocked" : "active";
    await this._clientRepository.findByIdAndUpdate(user.id, {
      status: newStatus,
    });
  }

  private async handleTrainerStatusUpdate(userId: string): Promise<void> {
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
      await this.handleTrainerBlocked(userId);
    } else {
      await this.handleTrainerUnblocked(userId);
    }
  }

  private async handleTrainerBlocked(trainerId: string): Promise<void> {
    const affectedClients =
      await this._clientRepository.findClientsBySelectedTrainerId(trainerId);

    for (const client of affectedClients) {
      try {
        if (client.backupTrainerId) {
          // Reassign client to backup trainer
          await this._clientRepository.findByIdAndUpdate(client.id, {
            previousTrainerId: client.selectedTrainerId,
            selectedTrainerId: client.backupTrainerId,
            backupTrainerId: null,
            selectStatus: TrainerSelectionStatus.ACCEPTED,
          });

          // Handle slot reassignment with conflict check
          await this.reassignSlots(
            client.id!,
            trainerId,
            client.backupTrainerId
          );

          await this.notificationService.sendToUser(
            client.id!,
            "Trainer Blocked",
            `Your primary trainer was blocked. Your backup trainer has been assigned. Slots have been reassigned where possible; please check your schedule for any canceled slots.`,
            "INFO"
          );
        } else {
          // No backup trainer, cancel all slots
          await this.cancelSlots(
            client.id!,
            trainerId,
            "Trainer blocked, no backup trainer available"
          );

          await this.notificationService.sendToUser(
            client.id!,
            "Trainer Blocked",
            "Your primary trainer was blocked. Please choose a new trainer manually. All upcoming slots have been canceled.",
            "WARNING"
          );
        }
      } catch (err) {
        console.error(`Failed to process client ${client.id}:`, err);
      }
    }
  }

  private async handleTrainerUnblocked(trainerId: string): Promise<void> {
    const clientsToRestore =
      await this._clientRepository.findClientsByPreviousTrainerId(trainerId);

    for (const client of clientsToRestore) {
      try {
        // Restore original trainer
        await this._clientRepository.updateRaw(client.id!, {
          $set: {
            selectedTrainerId: trainerId,
            backupTrainerId: client.selectedTrainerId,
            selectStatus: TrainerSelectionStatus.ACCEPTED,
          },
          $unset: {
            previousTrainerId: "",
          },
        });

        // Reassign slots back to original trainer
        await this.reassignSlots(
          client.id!,
          client.selectedTrainerId!,
          trainerId
        );

        await this.notificationService.sendToUser(
          client.id!,
          "Trainer Reactivated",
          `Your original trainer is now active again and has been reassigned to you. Slots have been reassigned where possible; please check your schedule.`,
          "SUCCESS"
        );
      } catch (err) {
        console.error(`Failed to restore client ${client.id}:`, err);
      }
    }
  }

  private async reassignSlots(
    clientId: string,
    currentTrainerId: string,
    newTrainerId: string
  ): Promise<void> {
    const slots = await this._slotRepository.findBookedSlotsByClientAndTrainer(
      clientId,
      currentTrainerId
    );

    for (const slot of slots) {
      try {
        const slotStartTime = this.parseSlotDateTime(slot.date, slot.startTime);
        const slotEndTime = this.parseSlotDateTime(slot.date, slot.endTime);

        if (slotStartTime < new Date()) {
          continue; // Skip past slots
        }

        // Find if backup trainer has an available slot at same date/time
        const backupAvailableSlot =
          await this._slotRepository.findSlotByTrainerAndTime(
            newTrainerId,
            slot.date,
            slot.startTime,
            slot.endTime
          );

        if (
          backupAvailableSlot &&
          backupAvailableSlot.status === SlotStatus.AVAILABLE
        ) {
          // Book backup trainer's slot for client
          await this._slotRepository.update(backupAvailableSlot.id!, {
            clientId,
            status: SlotStatus.BOOKED,
          });

          // Cancel original slot of primary trainer
          await this.cancelSlot(
            slot,
            clientId,
            currentTrainerId,
            "Trainer blocked, reassigned to backup trainer"
          );

          console.log(
            `Reassigned slot ${slot.id} from primary trainer ${currentTrainerId} to backup trainer ${newTrainerId} for client ${clientId}`
          );

          // Notify client and backup trainer about reassignment
          const newTrainer = await this._trainerRepository.findById(
            newTrainerId
          );
          const formattedDateTime = format(slotStartTime, "PPpp");

          await this.notificationService.sendToUser(
            clientId,
            "Slot Reassigned",
            `Your session on ${formattedDateTime} has been reassigned to ${newTrainer?.firstName} ${newTrainer?.lastName}.`,
            "INFO"
          );

          if (newTrainer) {
            await this.notificationService.sendToUser(
              newTrainerId,
              "New Session Assigned",
              `You have been assigned a session with client on ${formattedDateTime}.`,
              "INFO"
            );
          }
        } else {
          // No available slot for backup trainer - cancel original slot
          await this.cancelSlot(
            slot,
            clientId,
            currentTrainerId,
            "Trainer blocked, no available slot with backup trainer"
          );

          console.log(
            `Canceled slot ${slot.id} for client ${clientId} due to no available backup slot.`
          );
        }
      } catch (err) {
        console.error(`Failed to process slot ${slot.id}:`, err);
      }
    }
  }

  private async cancelSlots(
    clientId: string,
    trainerId: string,
    reason: string
  ): Promise<void> {
    const slots = await this._slotRepository.findBookedSlotsByClientAndTrainer(
      clientId,
      trainerId
    );

    for (const slot of slots) {
      try {
        const slotStartTime = this.parseSlotDateTime(slot.date, slot.startTime);
        if (slotStartTime < new Date()) {
          continue; // Skip past slots
        }

        await this.cancelSlot(slot, clientId, trainerId, reason);
      } catch (err) {
        console.error(`Failed to cancel slot ${slot.id}:`, err);
      }
    }
  }

  private async cancelSlot(
    slot: ISlotEntity,
    clientId: string,
    trainerId: string,
    reason: string
  ): Promise<void> {
    await this._slotRepository.updateStatus(
      slot.id!,
      SlotStatus.AVAILABLE,
      undefined,
      false,
      reason
    );

    const cancellationData: Partial<ICancellationEntity> = {
      slotId: slot.id!,
      clientId,
      trainerId,
      cancellationReason: reason,
	  cancelledBy: "trainer",
      cancelledAt: new Date(),
    };
    await this._cancellationRepository.save(cancellationData);

    const slotDateTime = this.parseSlotDateTime(slot.date, slot.startTime);
    const formattedDateTime = format(slotDateTime, "PPpp");

    await this.notificationService.sendToUser(
      clientId,
      "Slot Canceled",
      `Your session on ${formattedDateTime} was canceled due to: ${reason}. Please rebook a new slot.`,
      "WARNING"
    );

    console.log(
      `Slot ${slot.id} canceled for client ${clientId} due to: ${reason}`
    );
  }

  private parseSlotDateTime(date: string, time: string): Date {
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }
}
