import { injectable, inject } from "tsyringe";
import { IEndVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/end-video-usecase.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import {
  ROLES,
  SlotStatus,
  TrainerSelectionStatus,
  VideoCallStatus,
} from "@/shared/constants";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { ISlotEntity } from "@/entities/models/slot.entity";

@injectable()
export class EndVideoCallUseCase implements IEndVideoCallUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(
    slotId: string,
    userId: string,
    role: "trainer" | "client"
  ): Promise<ISlotEntity> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }
    if (
      (role === ROLES.TRAINER && slot.trainerId.toString() !== userId) ||
      (role === ROLES.USER && slot.clientId !== userId)
    ) {
      throw new CustomError(
        "Unauthorized: You do not have access to this slot",
        HTTP_STATUS.FORBIDDEN
      );
    }

    if (slot.status !== SlotStatus.BOOKED) {
      throw new CustomError("Slot is not booked", HTTP_STATUS.BAD_REQUEST);
    }

    if (slot.videoCallStatus !== VideoCallStatus.IN_PROGRESS) {
      throw new CustomError(
        "Video call is not in progress",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (role === "trainer" && slot.trainerId.toString() !== userId) {
      throw new CustomError(
        "Only the assigned trainer can end the call",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (role === "client") {
      const client = await this.clientRepository.findByClientNewId(userId);
      if (
        !client ||
        client.id !== slot.clientId ||
        client.selectStatus !== TrainerSelectionStatus.ACCEPTED
      ) {
        throw new CustomError(
          "Unauthorized client or invalid relationship",
          HTTP_STATUS.UNAUTHORIZED
        );
      }
    }

    const updatedSlot = await this.slotRepository.endVideoCall(slotId);
    if (!updatedSlot) {
      throw new CustomError(
        "Failed to end video call",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedSlot;
  }
}