import { INotificationModel } from "../models/notification.model";
import { Schema } from "mongoose";


export const NotificationSchema = new Schema<INotificationModel>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'WARNING', 'ERROR', 'SUCCESS'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
