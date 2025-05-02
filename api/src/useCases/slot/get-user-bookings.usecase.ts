import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

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
      console.error('GetUserBookingsUseCase - Invalid userClientId:', userClientId);
      throw new CustomError("Valid Client ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    console.log('GetUserBookingsUseCase - userClientId:', userClientId);

    const bookedSlots = await this.slotRepository.findBookedSlotsByClientId(userClientId);

    console.log('GetUserBookingsUseCase - bookedSlots:', bookedSlots);

    if (!bookedSlots.length) {
      console.log('GetUserBookingsUseCase - No bookings found for clientId:', userClientId);
    }

    return bookedSlots;
  }
}