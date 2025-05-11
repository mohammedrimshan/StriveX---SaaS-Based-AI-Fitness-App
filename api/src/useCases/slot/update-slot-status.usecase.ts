import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";
import { IToggleSlotAvailabilityUseCase } from "@/entities/useCaseInterfaces/slot/chage-slot-status-usecase.interface";

@injectable()
export class ToggleSlotAvailabilityUseCase
  implements IToggleSlotAvailabilityUseCase
{
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(trainerId: string, slotId: string): Promise<ISlotEntity> {
    if (!trainerId || !slotId) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_AND_SLOT_ID_REQUIRED,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError(
        ERROR_MESSAGES.SLOT_UNAVAILABLE,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (slot.trainerId !== trainerId) {
      throw new CustomError(
        ERROR_MESSAGES.UNAUTHORIZED_TOGGLE_SLOT,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (slot.isBooked) {
      throw new CustomError(
        ERROR_MESSAGES.BOOKED_SLOT_CANNOT_TOGGLE,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const updatedSlot = await this.slotRepository.update(slotId, {
      isAvailable: !slot.isAvailable,
      updatedAt: new Date(),
    });

    if (!updatedSlot) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_TO_UPDATE_SLOT_AVAILABILITY,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedSlot;
  }
}
