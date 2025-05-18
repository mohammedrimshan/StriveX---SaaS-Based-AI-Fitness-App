
import {  model, Document } from 'mongoose';
import { INotificationEntity } from '@/entities/models/notification.entity';
import { NotificationSchema } from '../schemas/notification.schema';
export interface INotificationModel extends Omit<INotificationEntity, 'id'>, Document {
  _id: string;
}


export const NotificationModel = model<INotificationModel>('Notification', NotificationSchema);