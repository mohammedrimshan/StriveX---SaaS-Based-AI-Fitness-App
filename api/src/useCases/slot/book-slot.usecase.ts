import { inject, injectable } from "tsyringe";
import { IBookSlotUseCase } from "../../entities/useCaseInterfaces/slot/book-slot-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/constants";
import { SlotStatus } from "../../shared/constants";

@injectable()
export class BookSlotUseCase implements IBookSlotUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(clientId: string, slotId: string): Promise<ISlotEntity> {
    const existingBookedSlot = await this.slotRepository.findAnyBookedSlotByClientId(clientId);
    if (existingBookedSlot) {
      throw new CustomError(
        ERROR_MESSAGES.ALREADY_BOOKED_SESSION,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError(ERROR_MESSAGES.SLOT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new CustomError(ERROR_MESSAGES.SLOT_NOT_AVAILABLE, HTTP_STATUS.BAD_REQUEST);
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
      throw new CustomError(ERROR_MESSAGES.PAST_SLOT_BOOKING, HTTP_STATUS.BAD_REQUEST);
    }
    const updatedSlot = await this.slotRepository.updateStatus(
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

    return updatedSlot;
  }
}
