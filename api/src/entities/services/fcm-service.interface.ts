import { INotificationEntity } from "../models/notification.entity";

export interface IFCMService {
  sendPushNotification(userId: string, title: string, message: string, notificationId: string, type: INotificationEntity['type']): Promise<void>;
}