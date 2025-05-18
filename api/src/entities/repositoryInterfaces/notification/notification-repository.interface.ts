import { INotificationEntity } from "@/entities/models/notification.entity";
import { IBaseRepository } from "../base-repository.interface";
export interface INotificationRepository extends IBaseRepository<INotificationEntity> {
  create(notification: INotificationEntity): Promise<INotificationEntity>;
  findByUserId(userId: string, page: number, limit: number): Promise<INotificationEntity[]>;
  markAsRead(notificationId: string): Promise<void>;
}