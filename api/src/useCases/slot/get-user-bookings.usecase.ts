import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

export interface IGetUserBookingsUseCase {
  execute(userClientId: string): Promise<ISlotEntity[]>;
}

@injectable()
export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(
    @inject("ISlotRepository") private readonly slotRepository: ISlotRepository
  ) {}

  async execute(userClientId: string): Promise<ISlotEntity[]> {
    if (!userClientId || typeof userClientId !== 'string' || userClientId.trim() === '') {
      throw new CustomError(ERROR_MESSAGES.INVALID_CLIENT_ID, HTTP_STATUS.BAD_REQUEST);
    }

    const bookedSlots = await this.slotRepository.findBookedSlotsByClientId(userClientId);

    if (bookedSlots.length === 0) {
      throw new CustomError(ERROR_MESSAGES.NO_BOOKINGS_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return bookedSlots;
  }
}
