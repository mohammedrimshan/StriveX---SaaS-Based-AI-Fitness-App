import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IGetVideoCallDetailsUseCase } from "@/entities/useCaseInterfaces/videocall/get-video-call-details.usecase.interface";
import { IEndVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/end-video-usecase.interface";
import { IStartVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/startvideo-usecase.interface";
import { IJoinVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/join-video-usecase.interface";
import { IVideoCallController } from "@/entities/controllerInterfaces/video-controller.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";

@injectable()
export class VideoCallController implements IVideoCallController {
  constructor(
    @inject("IGetVideoCallDetailsUseCase")
    private getVideoCallDetailsUseCase: IGetVideoCallDetailsUseCase,
    @inject("IEndVideoCallUseCase")
    private endVideoCallUseCase: IEndVideoCallUseCase,
    @inject("IStartVideoCallUseCase")
    private startVideoCallUseCase: IStartVideoCallUseCase,
    @inject("IJoinVideoCallUseCase")
    private joinVideoCallUseCase: IJoinVideoCallUseCase
  ) {}

  async startVideoCall(req: Request, res: Response): Promise<void> {
    try {
      const { slotId } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || !role) {
        throw new CustomError(
          "Unauthorized: Missing user ID or role",
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      if (role !== "trainer" && role !== "client") {
        throw new CustomError("Invalid role", HTTP_STATUS.BAD_REQUEST);
      }

      const updatedSlot = await this.startVideoCallUseCase.execute(
        slotId,
        userId,
        role
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Video call started successfully",
        videoCallDetails: {
          roomName: updatedSlot.videoCallRoomName,
        },
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async joinVideoCall(req: Request, res: Response): Promise<void> {
    try {
      const { slotId } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || !role) {
        throw new CustomError(
          "Unauthorized: Missing user ID or role",
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      if (role !== "trainer" && role !== "client") {
        throw new CustomError("Invalid role", HTTP_STATUS.BAD_REQUEST);
      }

      const slot = await this.joinVideoCallUseCase.execute(
        slotId,
        userId,
        role
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Joined video call successfully",
        videoCallDetails: {
          roomName: slot.videoCallRoomName,
        },
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getVideoCallDetails(req: Request, res: Response): Promise<void> {
    try {
      const { slotId } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || !role) {
        throw new CustomError(
          "Unauthorized: Missing user ID or role",
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      if (role !== "trainer" && role !== "client") {
        throw new CustomError("Invalid role", HTTP_STATUS.BAD_REQUEST);
      }

      const videoCallDetails = await this.getVideoCallDetailsUseCase.execute(
        slotId,
        userId,
        role
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        videoCallDetails: {
          roomName: videoCallDetails.roomName,
          token: videoCallDetails.token,
        },
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async endVideoCall(req: Request, res: Response): Promise<void> {
    try {
      const { slotId } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || !role) {
        throw new CustomError(
          "Unauthorized: Missing user ID or role",
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      if (role !== "trainer" && role !== "client") {
        throw new CustomError("Invalid role", HTTP_STATUS.BAD_REQUEST);
      }
      const updatedSlot = await this.endVideoCallUseCase.execute(
        slotId,
        userId,
        role
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Video call ended successfully",
        videoCallStatus: updatedSlot.videoCallStatus,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}