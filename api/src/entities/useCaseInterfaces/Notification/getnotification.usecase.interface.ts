import { INotificationEntity } from "@/entities/models/notification.entity";
export interface IGetNotifications {
  execute(page: number, limit: number): Promise<INotificationEntity[]>;
}
