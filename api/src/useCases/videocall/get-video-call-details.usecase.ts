import { injectable, inject } from "tsyringe";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ROLES, VideoCallStatus } from "@/shared/constants";
import { IGetVideoCallDetailsUseCase } from "@/entities/useCaseInterfaces/videocall/get-video-call-details.usecase.interface";
import { ZegoTokenService } from "@/interfaceAdapters/services/zego-token.service";

@injectable()
export class GetVideoCallDetailsUseCase implements IGetVideoCallDetailsUseCase {
  constructor(
    @inject("ISlotRepository") private _slotRepository: ISlotRepository,
    @inject("ZegoTokenService") private _zegoTokenService: ZegoTokenService
  ) {}

  async execute(slotId: string, userId: string, role: "trainer" | "client"): Promise<{
    roomName: string;
    token: string;
  }> {
    const slot = await this._slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }

    if (
      (role === ROLES.TRAINER && slot.trainerId.toString() !== userId) ||
      (role === ROLES.USER && slot.clientId !== userId)
    ) {
      throw new CustomError("Unauthorized: You do not have access to this slot", HTTP_STATUS.FORBIDDEN);
    }

    const videoCallDetails = await this._slotRepository.getVideoCallDetails(slotId);
    if (!videoCallDetails) {
      throw new CustomError("Video call details not found", HTTP_STATUS.NOT_FOUND);
    }

    if (videoCallDetails.videoCallStatus !== VideoCallStatus.IN_PROGRESS) {
      throw new CustomError(
        `Video call is not in progress (current status: ${videoCallDetails.videoCallStatus})`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!videoCallDetails.videoCallRoomName) {
      throw new CustomError("Video call room name missing", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const token = this._zegoTokenService.generateToken(userId, videoCallDetails.videoCallRoomName);

    return {
      roomName: videoCallDetails.videoCallRoomName,
      token,
    };
  }
}