import { inject, injectable } from "tsyringe";
import { ICancelBookingUseCase } from "../../entities/useCaseInterfaces/slot/cancel-booking-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS } from "../../shared/constants";
import { SlotStatus } from "../../shared/constants";

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(clientId: string, slotId: string): Promise<ISlotEntity> {
    const slot = await this.slotRepository.findBookedSlotByClientId(
      clientId,
      slotId
    );
    if (!slot) {
      throw new CustomError(
        "Slot not found or not booked by this client",
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Parse date and startTime to create a Date object
    const [year, month, day] = slot.date.split("-").map(Number);
    const [hours, minutes] = slot.startTime.split(":").map(Number);
    const slotStartTime = new Date(year, month - 1, day, hours, minutes);

    // Validate the parsed Date
    if (isNaN(slotStartTime.getTime())) {
      throw new CustomError(
        "Invalid slot date or time",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Calculate cancellation threshold (30 minutes before slot start)
    const cancellationThreshold = new Date(
      slotStartTime.getTime() - 30 * 60 * 1000
    );
    if (new Date() > cancellationThreshold) {
      throw new CustomError(
        "Cannot cancel within 30 minutes of slot start",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const updatedSlot = await this.slotRepository.updateStatus(
      slotId,
      SlotStatus.AVAILABLE,
      undefined,
      false 
    );
    if (!updatedSlot) {
      throw new CustomError(
        "Failed to cancel booking",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedSlot;
  }
}