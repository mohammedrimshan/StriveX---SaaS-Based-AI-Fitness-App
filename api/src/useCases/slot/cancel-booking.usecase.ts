import { inject, injectable } from "tsyringe";
import { ICancelBookingUseCase } from "../../entities/useCaseInterfaces/slot/cancel-booking-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/constants";
import { SlotStatus } from "../../shared/constants";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(clientId: string, slotId: string, cancellationReason?: string): Promise<ISlotEntity> {
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

    return updatedSlot;
  }
}