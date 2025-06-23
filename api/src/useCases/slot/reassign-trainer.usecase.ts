import { inject, injectable } from "tsyringe";
import { IReassignTrainerUseCase } from "@/entities/useCaseInterfaces/slot/reassign-trainer-usecase.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { CustomError } from "@/entities/utils/custom.error";
import {
  HTTP_STATUS,
  SlotStatus,
  TrainerApprovalStatus,
} from "@/shared/constants";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { ICancellationRepository } from "@/entities/repositoryInterfaces/slot/cancellation.repository.interface";
import { Types } from "mongoose";
import { IClientEntity } from "@/entities/models/client.entity";

@injectable()
export class ReassignTrainerUseCase implements IReassignTrainerUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ICancellationRepository")
    private cancellationRepository: ICancellationRepository,
    @inject("NotificationService")
    private notificationService: NotificationService
  ) {}

  async execute(slotId: string, reason: string): Promise<ISlotEntity> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot || !slot.isBooked || !slot.clientId) {
      throw new CustomError(
        "Slot not found or not booked",
        HTTP_STATUS.NOT_FOUND
      );
    }

    const client = await this.clientRepository.findById(slot.clientId);
    if (!client) {
      throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
    }

    // Step 1: Backup trainer
    if (client.backupTrainerId) {
      const backupTrainer = await this.trainerRepository.findById(
        client.backupTrainerId
      );
      if (
        backupTrainer &&
        backupTrainer.approvalStatus === TrainerApprovalStatus.APPROVED &&
        !backupTrainer.optOutBackupRole &&
        backupTrainer.status === "active"
      ) {
        const availableSlot =
          await this.slotRepository.findSlotByTrainerAndTime(
            client.backupTrainerId.toString(),
            slot.date,
            slot.startTime,
            slot.endTime
          );

        if (availableSlot && !availableSlot.isBooked) {
          const updatedSlot = await this.slotRepository.update(
            availableSlot.id!,
            {
              clientId: client.id!,
              isBooked: true,
              isAvailable: false,
              trainerId: backupTrainer.id,
              previousTrainerId: [slot.trainerId],
              cancellationReason: reason,
              status: SlotStatus.BOOKED,
              bookedAt: new Date(),
            }
          );

          if (!updatedSlot) {
            throw new CustomError(
              "Failed to assign slot to backup trainer",
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
          }

          await this.sendNotifications(
            client,
            backupTrainer,
            slot,
            updatedSlot,
            reason
          );

          try {
            await this.trainerRepository.addBackupClient(
              backupTrainer.id!.toString(),
              client.id!
            );
          } catch (err) {
            console.error("Failed to add backup client", err);
          }

          await this.slotRepository.delete(slot.id!);

          await this.cancellationRepository.save({
            slotId: slot.id!,
            clientId: slot.clientId,
            trainerId: slot.trainerId,
            cancellationReason: reason,
            cancelledBy: "trainer",
            cancelledAt: new Date(),
          });

          return updatedSlot;
        }
      }
    }

    // Step 2: Find top 3 eligible trainers excluding primary & backup
    const excludedTrainerIds: Types.ObjectId[] = [
      slot.trainerId,
      ...(slot.previousTrainerId || []),
      client.selectedTrainerId,
      client.backupTrainerId,
    ]
      .filter((id): id is string => !!id && Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

      console.log(excludedTrainerIds,"EXCLUDED TRAINERS")

    const topTrainers =
      await this.trainerRepository.findAvailableBackupTrainers(
        client,
        excludedTrainerIds
      );

      console.log(topTrainers,"TOP TRAINERS")
    for (const trainer of topTrainers) {
      const hasConflict = await this.slotRepository.findSlotByTrainerAndTime(
        trainer.id!.toString(),
        slot.date,
        slot.startTime,
        slot.endTime
      );

      if (!hasConflict || !hasConflict.isBooked) {
        return await this.assignSlotToTrainer(slot, client, trainer, reason);
      }
    }

    // Step 3: Fallback — cancel the session
    const updatedSlot = await this.slotRepository.updateStatus(
      slotId,
      SlotStatus.AVAILABLE,
      undefined,
      false,
      reason
    );

    if (!updatedSlot) {
      throw new CustomError(
        "Failed to cancel slot",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    await this.cancellationRepository.save({
      slotId,
      clientId: slot.clientId,
      trainerId: slot.trainerId,
      cancellationReason: reason,
      cancelledBy: "trainer",
      cancelledAt: new Date(),
    });

    await this.notificationService.sendToUser(
      slot.clientId.toString(),
      "Slot Cancelled",
      `Your session on ${slot.date} at ${slot.startTime} was cancelled due to trainer emergency: ${reason}. Please rebook.`,
      "WARNING"
    );

    await this.notificationService.sendToUser(
      slot.trainerId!.toString(),
      "Slot Cancellation Confirmed",
      `Your session on ${slot.date} at ${slot.startTime} was cancelled due to: ${reason}.`,
      "INFO"
    );

    return updatedSlot;
  }

  private async assignSlotToTrainer(
  slot: ISlotEntity,
  client: IClientEntity,
  trainer: any,
  reason: string
): Promise<ISlotEntity> {
  const previousTrainerId = [
    ...(slot.previousTrainerId || []),
    slot.trainerId!.toString(),
  ];

  const updatedSlot = await this.slotRepository.update(slot.id!, {
    trainerId: trainer.id!.toString(),
    previousTrainerId,
    cancellationReason: reason,
    status: SlotStatus.BOOKED,
    isBooked: true,
    isAvailable: false,
    bookedAt: new Date(),
    clientId: client.id!.toString(),
  });

  if (!updatedSlot) {
    throw new CustomError(
      "Failed to reassign trainer",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  await this.sendNotifications(client, trainer, slot, updatedSlot, reason);

  try {
    await this.trainerRepository.addBackupClient(
      trainer.id!.toString(),
      client.id!.toString()
    );
  } catch (err) {
    console.error("Failed to add backup client to trainer", err);
  }

  // Remove this deletion to keep the slot
  // await this.slotRepository.delete(slot.id!);

  await this.cancellationRepository.save({
    slotId: slot.id!,
    clientId: slot.clientId,
    trainerId: slot.trainerId,
    cancellationReason: reason,
    cancelledBy: "trainer",
    cancelledAt: new Date(),
  });

  return updatedSlot;
}


  private async sendNotifications(
    client: IClientEntity,
    trainer: any,
    oldSlot: ISlotEntity,
    newSlot: ISlotEntity,
    reason: string
  ) {
    const clientName = `${client.firstName} ${client.lastName}`;
    const trainerName = `${trainer.firstName} ${trainer.lastName}`;

    await this.notificationService.sendToUser(
      client.id!.toString(),
      "Trainer Reassigned",
      `Your session on ${oldSlot.date} at ${oldSlot.startTime} has been reassigned to ${trainerName} due to: ${reason}.`,
      "INFO",
      `/slots/${newSlot.id}`
    );

    await this.notificationService.sendToUser(
      trainer.id!.toString(),
      "New Session Assigned",
      `You have been assigned a session with ${clientName} on ${oldSlot.date} at ${oldSlot.startTime} due to: ${reason}.`,
      "INFO",
      `/slots/${newSlot.id}`
    );
  }
}
