// src/types/notification.ts
export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
  isTemporary?: boolean;
}
