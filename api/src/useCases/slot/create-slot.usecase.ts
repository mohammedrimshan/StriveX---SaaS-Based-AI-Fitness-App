import { inject, injectable } from "tsyringe";
import { ICreateSlotUseCase } from "../../entities/useCaseInterfaces/slot/create-slot-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/constants";
import slotExpiryQueue from "../../frameworks/queue/bull/slot-expiry.setup";
import { SlotStatus } from "../../shared/constants";

@injectable()
export class CreateSlotUseCase implements ICreateSlotUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(
    trainerId: string,
    slotData: { date: string; startTime: string; endTime: string }
  ): Promise<ISlotEntity> {
    const slotDate = new Date(slotData.date);
    if (isNaN(slotDate.getTime())) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_DATE_FORMAT,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const [startHours, startMinutes] = slotData.startTime
      .split(":")
      .map(Number);
    const [endHours, endMinutes] = slotData.endTime.split(":").map(Number);

    const startTime = new Date(slotDate);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date(slotDate);
    endTime.setHours(endHours, endMinutes, 0, 0);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_TIME_FORMAT(
          slotData.startTime,
          slotData.endTime
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    

    if (startTime >= endTime) {

        const isNextDaySlot = endTime.getDate() !== startTime.getDate();

      if (isNextDaySlot) {
        throw new CustomError(
          "Slot time cannot span across multiple days. Please select a time range within the same day.",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      
      throw new CustomError(
        ERROR_MESSAGES.START_TIME_BEFORE_END_TIME(
          slotData.startTime,
          slotData.endTime
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const durationInMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationInMinutes !== 30) {
      throw new CustomError(
        `Each slot must be exactly 30 minutes. Given duration is ${durationInMinutes} minutes.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const overlappingSlots = await this.slotRepository.findOverlappingSlots(
      trainerId,
      startTime,
      endTime
    );
    if (overlappingSlots.length > 0) {
      throw new CustomError(
        ERROR_MESSAGES.SLOT_OVERLAPS(slotData.startTime, slotData.endTime),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const formattedDate = `${slotDate.getFullYear()}-${String(
      slotDate.getMonth() + 1
    ).padStart(2, "0")}-${String(slotDate.getDate()).padStart(2, "0")}`;
    const formattedStartTime = `${String(startHours).padStart(2, "0")}:${String(
      startMinutes
    ).padStart(2, "0")}`;
    const formattedEndTime = `${String(endHours).padStart(2, "0")}:${String(
      endMinutes
    ).padStart(2, "0")}`;
    const [year, month, day] = formattedDate.split("-").map(Number);
    const expiresAt = new Date(year, month - 1, day, endHours, endMinutes);
    const slot: Partial<ISlotEntity> = {
      trainerId,
      date: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      status: SlotStatus.AVAILABLE,
      isBooked: false,
      isAvailable: true,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedSlot = await this.slotRepository.save(slot);

    const slotEndTime = new Date(slotDate);
    slotEndTime.setHours(endHours, endMinutes, 0, 0);

    const delay = slotEndTime.getTime() - Date.now();
    if (delay > 0) {
      await slotExpiryQueue.add(
        { slotId: savedSlot.id },
        { delay: expiresAt.getTime() - Date.now() }
      );
    }

    return savedSlot as ISlotEntity;
  }
}
