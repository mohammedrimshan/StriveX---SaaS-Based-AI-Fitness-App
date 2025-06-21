import { injectable, inject } from "tsyringe";
import { INotificationRepository } from "@/entities/repositoryInterfaces/notification/notification-repository.interface";
import { IFCMService } from "@/entities/services/fcm-service.interface";
import { INotificationSocketService } from "@/entities/services/socket-service.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { INotificationEntity } from "@/entities/models/notification.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class NotificationService {
  constructor(
    @inject("INotificationRepository")
    private notificationRepository: INotificationRepository,
    @inject("IFCMService") private fcmService: IFCMService,
    @inject("INotificationSocketService")
    private socketService: INotificationSocketService,
    @inject("IClientRepository") private clientModel: IClientRepository
  ) {}

  async sendToUser(
    userId: string,
    title: string,
    message: string,
    type: INotificationEntity["type"],
    actionLink?: string,
    relatedEntityId?: string
  ): Promise<INotificationEntity> {
    const notification: INotificationEntity = {
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      ...(actionLink ? { actionLink } : {}),
      ...(relatedEntityId ? { relatedEntityId } : {}),
    };

    const savedNotification = await this.notificationRepository.create(
      notification
    );
    this.socketService.emitNotification(userId, savedNotification);

    try {
      await this.fcmService.sendPushNotification(
        userId,
        title,
        message,
        (savedNotification.id ?? "").toString(),
        type
      );
    } catch (error) {
      console.error(
        `Failed to send push notification to user ${userId}:`,
        error
      );
    }

    return {
      ...savedNotification,
      id: (savedNotification.id ?? "").toString(),
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    console.log(notificationId, "NOTIFICATION ID MARK AS READ");
    try {
      await this.notificationRepository.markAsRead(notificationId);
    } catch (error) {
      throw new CustomError(
        "Failed to mark notification as read",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<INotificationEntity[]> {
    console.log(userId, "NOTIFICATION USER ID");
    try {
      return await this.notificationRepository.findByUserId(
        userId,
        page,
        limit
      );
    } catch (error) {
      throw new CustomError(
        "Failed to fetch notifications",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
