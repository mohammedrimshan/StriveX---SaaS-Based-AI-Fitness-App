import { injectable, inject } from "tsyringe";
import { IStartVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/startvideo-usecase.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { SlotStatus, TrainerSelectionStatus, VideoCallStatus } from "@/shared/constants";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";

@injectable()
export class StartVideoCallUseCase implements IStartVideoCallUseCase {
  constructor(
    @inject("ISlotRepository") private _slotRepository: ISlotRepository,
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("NotificationService") private _notificationService: NotificationService

  ) {}

  async execute(
    slotId: string,
    userId: string,
    role: "trainer" | "client"
  ): Promise<ISlotEntity> {
    const slot = await this._slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }

    if (slot.status !== SlotStatus.BOOKED) {
      throw new CustomError("Slot is not booked", HTTP_STATUS.BAD_REQUEST);
    }

    if (slot.videoCallStatus === VideoCallStatus.IN_PROGRESS) {
      throw new CustomError(
        "Video call is already in progress",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (role === "trainer" && slot.trainerId.toString() !== userId) {
      throw new CustomError(
        "Only the assigned trainer can start the call",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (role === "client") {
      const client = await this._clientRepository.findByClientNewId(userId);
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

    const roomName = `StriveX-${slotId}`;
    const updatedSlot = await this._slotRepository.updateVideoCallStatus(
      slotId,
      VideoCallStatus.IN_PROGRESS,
      roomName,
    );

    if (!updatedSlot) {
      throw new CustomError(
        "Failed to start video call",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    if (role === "trainer") {
      const client = await this._clientRepository.findById(slot.clientId);
      if (client) {
        try {
          await this._notificationService.sendToUser(
            client.id as string,
            "Call Started",
            "Your trainer has started the session. Join the call now.",
            "INFO"
          );
        } catch (error) {
          console.error("Failed to send video call notification to client:", error);
        }
      }
    }
    return updatedSlot;
  }
}