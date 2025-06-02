import { inject, injectable } from "tsyringe";
import { ICancelBookingUseCase } from "../../entities/useCaseInterfaces/slot/cancel-booking-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ICancellationRepository } from "../../entities/repositoryInterfaces/slot/cancellation.repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { ICancellationEntity } from "../../entities/models/cancellation.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/constants";
import { SlotStatus } from "../../shared/constants";
import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "../../entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { NotificationService } from "../../interfaceAdapters/services/notification.service";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("ICancellationRepository")
    private cancellationRepository: ICancellationRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("NotificationService")
    private notificationService: NotificationService
  ) {}

  async execute(
    clientId: string,
    slotId: string,
    cancellationReason?: string
  ): Promise<ISlotEntity> {
    const slot = await this.slotRepository.findBookedSlotByClientId(
      clientId,
      slotId
    );
    if (!slot) {
      throw new CustomError(
        ERROR_MESSAGES.SLOT_NOT_FOUND_OR_NOT_BOOKED,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const [year, month, day] = slot.date.split("-").map(Number);
    const [hours, minutes] = slot.startTime.split(":").map(Number);
    const slotStartTime = new Date(year, month - 1, day, hours, minutes);

    if (isNaN(slotStartTime.getTime())) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_SLOT_DATE_TIME,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    const cancellationThreshold = new Date(
      slotStartTime.getTime() - 30 * 60 * 1000
    );
    if (new Date() > cancellationThreshold) {
      throw new CustomError(
        ERROR_MESSAGES.CANNOT_CANCEL_WITHIN_30_MINUTES,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!cancellationReason || cancellationReason.trim() === "") {
      throw new CustomError(
        "Cancellation reason is required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const updatedSlot = await this.slotRepository.updateStatus(
      slotId,
      SlotStatus.AVAILABLE,
      undefined,
      false,
      cancellationReason
    );
    if (!updatedSlot) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_CANCEL_BOOKING,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    const cancellationData: Partial<ICancellationEntity> = {
      slotId: slotId,
      clientId: clientId,
      trainerId: slot.trainerId,
      cancellationReason: cancellationReason,
      cancelledAt: new Date(),
    };
    await this.cancellationRepository.save(cancellationData);

    try {
      let clientName = "Someone";
      const client = await this.clientRepository.findByClientNewId(clientId);
      if (client) {
        clientName = `${client.firstName} ${client.lastName}`;
      }

      const trainer = await this.trainerRepository.findById(slot.trainerId);
      if (trainer) {
        await this.notificationService.sendToUser(
          slot.trainerId as string,
          "Slot Cancellation",
          `${clientName} canceled their booking for your slot on ${slot.date} at ${slot.startTime}. Reason: ${cancellationReason}`,
          "WARNING"
        );
      }
    } catch (error) {
      console.error("Notification error:", error);
    }

    return updatedSlot;
  }
}
