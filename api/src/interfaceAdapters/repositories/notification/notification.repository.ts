
import { injectable } from "tsyringe";
import { INotificationRepository } from "@/entities/repositoryInterfaces/notification/notification-repository.interface";
import { INotificationEntity } from "@/entities/models/notification.entity";
import { NotificationModel } from "@/frameworks/database/mongoDB/models/notification.model";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { BaseRepository } from "../base.repository";

@injectable()
export class NotificationRepository
  extends BaseRepository<INotificationEntity>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  async create(
    notification: INotificationEntity
  ): Promise<INotificationEntity> {
    try {
      console.log(
        `[${new Date().toISOString()}] Creating notification: ${JSON.stringify(
          notification
        )}`
      );
      const createdNotification = await this.model.create(notification);
      const result = this.mapToEntity(createdNotification.toObject());
      console.log(
        `[${new Date().toISOString()}] Created notification: ${JSON.stringify(
          result
        )}`
      );
      return result;
    } catch (error) {
      throw new CustomError(
        "Failed to create notification",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<INotificationEntity[]> {
    try {
      const query = { userId };
      const notifications = await this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return notifications.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      throw new CustomError(
        "Failed to fetch notifications",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    console.log(notificationId, "Notification ID");
    try {
      const updatedNotification = await this.model
        .findByIdAndUpdate(
          notificationId,
          { $set: { isRead: true } },
          { new: true }
        )
        .lean();

      if (!updatedNotification) {
        throw new CustomError("Notification not found", HTTP_STATUS.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        "Failed to mark notification as read",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
