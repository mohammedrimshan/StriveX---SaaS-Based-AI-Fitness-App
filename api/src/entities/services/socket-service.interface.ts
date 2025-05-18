
import { INotificationEntity } from "../models/notification.entity";

export interface INotificationSocketService {
 
  emitNotification(userId: string, notification: INotificationEntity): void;
}