import { Request, Response } from "express";

export interface INotificationController {
  sendNotification(req: Request, res: Response): Promise<void>;
  getAllNotifications(req: Request, res: Response): Promise<void>;
  getUserNotifications(req: Request, res: Response): Promise<void>;
  markNotificationAsRead(req: Request, res: Response): Promise<void>;
  updateFCMToken(req: Request, res: Response): Promise<void>;
}
