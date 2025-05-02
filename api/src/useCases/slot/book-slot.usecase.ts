import { inject, injectable } from "tsyringe";
import { IBookSlotUseCase } from "../../entities/useCaseInterfaces/slot/book-slot-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS } from "../../shared/constants";
import { SlotStatus } from "../../shared/constants";

@injectable()
export class BookSlotUseCase implements IBookSlotUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(clientId: string, slotId: string): Promise<ISlotEntity> {
    // Check if the client already has a booked slot
    const existingBookedSlot = await this.slotRepository.findAnyBookedSlotByClientId(clientId);
    if (existingBookedSlot) {
      throw new CustomError(
        "You already have a booked session. Only one session can be booked at a time.",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Find the slot by ID
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check if the slot is available
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new CustomError("Slot is not available", HTTP_STATUS.BAD_REQUEST);
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

    // Check if the slot is in the past
    if (slotStartTime < new Date()) {
      throw new CustomError("Cannot book past slot", HTTP_STATUS.BAD_REQUEST);
    }

    // Update the slot status to BOOKED and associate it with the client
    const updatedSlot = await this.slotRepository.updateStatus(
      slotId,
      SlotStatus.BOOKED,
      clientId
    );
    if (!updatedSlot) {
      throw new CustomError(
        "Failed to book slot",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedSlot;
  }
}