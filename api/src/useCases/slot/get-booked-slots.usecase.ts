
import { inject, injectable } from "tsyringe";
import { IGetBookedTrainerSlotsUseCase } from "@/entities/useCaseInterfaces/slot/get-booked-slots.usecase.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { SlotResponseDTO } from "@/shared/dto/user.dto";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, SlotStatus } from "@/shared/constants";
import { Types } from "mongoose";

@injectable()
export class GetBookedTrainerSlotsUseCase implements IGetBookedTrainerSlotsUseCase {
  constructor(@inject("ISlotRepository") private slotRepository: ISlotRepository) {}

  async execute(trainerId: string): Promise<SlotResponseDTO[]> {
    if (!trainerId || !Types.ObjectId.isValid(trainerId)) {
      throw new CustomError("Valid Trainer ID is required", HTTP_STATUS.BAD_REQUEST);
    }
    

    const slots = await this.slotRepository.findSlotsWithClients(trainerId);
    console.log(slots, "SLOTS DATA");

    return slots
      .filter((slot) => slot.status === SlotStatus.BOOKED || slot.cancellationReason)
      .map((slot) => ({
        id: slot.id!,
        trainerId: slot.trainerId.toString(),
        trainerName: slot.trainerName || "Unknown Trainer",
        clientId: slot.clientId,
        clientName: slot.client?.firstName ? `${slot.client.firstName} ${slot.client.lastName}` : "Unknown Client",
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        isBooked: slot.isBooked,
        isAvailable: slot.isAvailable,
        cancellationReason: slot.cancellationReason,
        videoCallStatus: slot.videoCallStatus,
        videoCallRoomName: slot.videoCallRoomName,
        client: slot.client,
      }));
  }
}
