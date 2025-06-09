import { Request, Response } from "express";

export interface IAdminDashboardController {
  getDashboardStats(req: Request, res: Response): Promise<void>;
  getTopPerformingTrainers(req: Request, res: Response): Promise<void>;
  getPopularWorkouts(req: Request, res: Response): Promise<void>;
  getUserAndSessionData(req: Request, res: Response): Promise<void>;
  exportRevenueReport(req: Request, res: Response): Promise<void>;
  exportSessionReport(req: Request, res: Response): Promise<void>;
}
