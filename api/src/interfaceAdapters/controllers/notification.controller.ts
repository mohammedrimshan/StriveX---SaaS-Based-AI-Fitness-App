import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { INotificationController } from "@/entities/controllerInterfaces/notification.controller.interface";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { IGetNotifications } from "@/entities/useCaseInterfaces/Notification/getnotification.usecase.interface";
import { IUpdateFCMTokenUseCase } from "@/entities/useCaseInterfaces/Notification/update-fcm-token-usecase.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { HTTP_STATUS } from "@/shared/constants";
import { INotificationEntity } from "@/entities/models/notification.entity";
import { CustomRequest } from "../middlewares/auth.middleware";

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject("NotificationService")
    private notificationService: NotificationService,
    @inject("IGetNotifications") private getNotifications: IGetNotifications,
    @inject("IUpdateFCMTokenUseCase")
    private updateFCMTokenUseCase: IUpdateFCMTokenUseCase
  ) {}

  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, title, message, type } = req.body;
      if (!userId || !title || !message || !type) {
        throw new Error("Missing required fields");
      }
      const notification = await this.notificationService.sendToUser(
        userId,
        title,
        message,
        type as INotificationEntity["type"]
      );
      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: notification,
        message: "Notification sent successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", size, limit = "10" } = req.query;
      const notifications = await this.getNotifications.execute(
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );
      console.log(
        `[${new Date().toISOString()}] Retrieved ${
          notifications.length
        } notifications`
      );
      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: notifications,
        message: "Notifications retrieved successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userPayload = (req as CustomRequest).user;
      const userId = typeof userPayload === "string" ? userPayload : userPayload.id;
      const { page = "1", limit = "10" } = req.query;
      const notifications = await this.notificationService.getUserNotifications(
        userId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );
      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: notifications,
        message: "User notifications retrieved successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      await this.notificationService.markAsRead(notificationId);
      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: null,
        message: "Notification marked as read",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateFCMToken(req: Request, res: Response): Promise<void> {
    try {
      const { userId, fcmToken } = req.body;
      await this.updateFCMTokenUseCase.execute(userId, fcmToken);
      res.status(HTTP_STATUS.OK).json({ message: "FCM token updated" });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
