import { inject, injectable } from "tsyringe";
import { IBookSlotUseCase } from "../../entities/useCaseInterfaces/slot/book-slot-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/constants";
import { SlotStatus } from "../../shared/constants";
import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "../../entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { NotificationService } from "../../interfaceAdapters/services/notification.service";

@injectable()
export class BookSlotUseCase implements IBookSlotUseCase {
  constructor(
    @inject("ISlotRepository") private _slotRepository: ISlotRepository,
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository,
    @inject("NotificationService") private _notificationService: NotificationService
  ) {}

  async execute(clientId: string, slotId: string): Promise<ISlotEntity> {
    const slot = await this._slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError(
        ERROR_MESSAGES.SLOT_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new CustomError(
        ERROR_MESSAGES.SLOT_NOT_AVAILABLE,
        HTTP_STATUS.BAD_REQUEST
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

    if (slotStartTime < new Date()) {
      throw new CustomError(
        ERROR_MESSAGES.PAST_SLOT_BOOKING,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingSlot = await this._slotRepository.findBookedSlotByClientIdAndDate(
      clientId,
      slot.date
    );

    if (existingSlot) {
      throw new CustomError(
        "You have already booked a slot for this date",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const updatedSlot = await this._slotRepository.updateStatus(
      slotId,
      SlotStatus.BOOKED,
      clientId
    );

    if (!updatedSlot) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_BOOKING_SLOT,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    try {
      let clientName = "Someone";
      const client = await this._clientRepository.findByClientNewId(clientId);
      if (client) {
        clientName = `${client.firstName} ${client.lastName}`;
      }

      const trainer = await this._trainerRepository.findById(slot.trainerId);
      if (trainer) {
        await this._notificationService.sendToUser(
          slot.trainerId as string,
          "Slot Booked",
          `${clientName} booked your slot on ${slot.date} at ${slot.startTime}!`,
          "SUCCESS"
        );
      }
    } catch (error) {
      console.error("Notification error:", error);
    }

    return updatedSlot;
  }
}
