import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ICancellationRepository } from "../../entities/repositoryInterfaces/slot/cancellation.repository.interface";
import { ITrainerRepository } from "../../entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-repository.interface";
import { NotificationService } from "../../interfaceAdapters/services/notification.service";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES, SlotStatus } from "../../shared/constants";
import { ITrainerSlotCancellationUseCase } from "@/entities/useCaseInterfaces/slot/trainer-slot-cancellation-usecase.interface";
import { IReassignTrainerUseCase } from "@/entities/useCaseInterfaces/slot/reassign-trainer-usecase.interface";

@injectable()
export class TrainerSlotCancellationUseCase implements ITrainerSlotCancellationUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("ICancellationRepository") private cancellationRepository: ICancellationRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("NotificationService") private notificationService: NotificationService,
    @inject("IReassignTrainerUseCase") private reassignTrainerUseCase: IReassignTrainerUseCase 
  ) {}

  async execute(
    trainerId: string,
    slotId: string,
    cancellationReason: string
  ): Promise<ISlotEntity> {
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const slot = await this.slotRepository.findById(slotId);
    if (!slot || slot.trainerId !== trainerId) {
      throw new CustomError(ERROR_MESSAGES.SLOT_NOT_FOUND_OR_NOT_BOOKED, HTTP_STATUS.NOT_FOUND);
    }

    if (!slot.isBooked || !slot.clientId) {
      throw new CustomError("Slot is not booked by a client", HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Validate cancellation window
    const [year, month, day] = slot.date.split("-").map(Number);
    const [hours, minutes] = slot.startTime.split(":").map(Number);
    const slotStartTime = new Date(year, month - 1, day, hours, minutes);

    if (isNaN(slotStartTime.getTime())) {
      throw new CustomError(ERROR_MESSAGES.INVALID_SLOT_DATE_TIME, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const cancellationThreshold = new Date(slotStartTime.getTime() - 30 * 60 * 1000);
    if (new Date() > cancellationThreshold) {
      throw new CustomError(ERROR_MESSAGES.CANNOT_CANCEL_WITHIN_30_MINUTES, HTTP_STATUS.BAD_REQUEST);
    }

    if (!cancellationReason || cancellationReason.trim() === "") {
      throw new CustomError("Cancellation reason is required", HTTP_STATUS.BAD_REQUEST);
    }

    const updatedSlot = await this.slotRepository.updateStatus(
      slotId,
      SlotStatus.AVAILABLE,
      undefined,
      false,
      cancellationReason
    );
    if (!updatedSlot) {
      throw new CustomError(ERROR_MESSAGES.FAILED_CANCEL_BOOKING, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const cancellationData = {
      slotId,
      clientId: slot.clientId,
      trainerId,
      cancellationReason,
      cancelledAt: new Date(),
    };
    await this.cancellationRepository.save(cancellationData);

    try {
      const client = await this.clientRepository.findByClientNewId(slot.clientId);
      const clientName = client ? `${client.firstName} ${client.lastName}` : "A client";

      await this.notificationService.sendToUser(
        slot.clientId,
        "Slot Cancellation",
        `Your slot on ${slot.date} at ${slot.startTime} was cancelled by the trainer. Reason: ${cancellationReason}`,
        "WARNING"
      );

      await this.notificationService.sendToUser(
        trainerId,
        "Slot Cancellation Confirmed",
        `You cancelled the slot on ${slot.date} at ${slot.startTime} booked by ${clientName}. Reason: ${cancellationReason}`,
        "INFO"
      );
      await this.reassignTrainerUseCase.execute(slotId, cancellationReason);
    } catch (error) {
      console.error("Notification or reassignment error:", error);
    }

    return updatedSlot;
  }
}
