
import { injectable, inject } from "tsyringe";
import { IJoinVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/join-video-usecase.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { SlotStatus, TrainerSelectionStatus, VideoCallStatus } from "@/shared/constants";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { ISlotEntity } from "@/entities/models/slot.entity";

@injectable()
export class JoinVideoCallUseCase implements IJoinVideoCallUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(slotId: string, userId: string, role: "trainer" | "client"): Promise<ISlotEntity> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }

    if (slot.status !== SlotStatus.BOOKED) {
      throw new CustomError("Slot is not booked", HTTP_STATUS.BAD_REQUEST);
    }

    if (slot.videoCallStatus !== VideoCallStatus.IN_PROGRESS) {
      throw new CustomError("Video call has not started", HTTP_STATUS.BAD_REQUEST);
    }

    if (role === "trainer" && slot.trainerId.toString() !== userId) {
      throw new CustomError("Only the assigned trainer can join the call", HTTP_STATUS.UNAUTHORIZED);
    }

    if (role === "client") {
      const client = await this.clientRepository.findByClientNewId(userId);
      console.log(client, "client in join video call");
      if (!client || client.id !== slot.clientId || client.selectStatus !== TrainerSelectionStatus.ACCEPTED) {
        throw new CustomError("Unauthorized client or invalid relationship", HTTP_STATUS.UNAUTHORIZED);
      }
    }

    return slot;
  }
}