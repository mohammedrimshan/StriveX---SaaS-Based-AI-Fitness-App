
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { Parser } from "json2csv";
import { HTTP_STATUS } from "@/shared/constants";
import { IGetDashboardStatsUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/getdashboard-stats.usecase.interface";
import { IGetTopPerformingTrainersUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-top-performing-trainer.usecase.interface";
import { IGetPopularWorkoutsUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-popular-workout.usecase";
import { IGetUserAndSessionDataUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-user-and-session-data.usecase.interface";
import { IGetRevenueReportUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-revenue-report.usecase.interface";
import { IGetSessionReportUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-session-report.usecase.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { IAdminDashboardController } from "@/entities/controllerInterfaces/admin-dashboard-controller.interface";

@injectable()
export class AdminDashboardController implements IAdminDashboardController{
  constructor(
    @inject("IGetDashboardStatsUseCase") private getDashboardStatsUseCase: IGetDashboardStatsUseCase,
    @inject("IGetTopPerformingTrainersUseCase") private getTopPerformingTrainersUseCase: IGetTopPerformingTrainersUseCase,
    @inject("IGetPopularWorkoutsUseCase") private getPopularWorkoutsUseCase: IGetPopularWorkoutsUseCase,
    @inject("IGetUserAndSessionDataUseCase") private getUserAndSessionDataUseCase: IGetUserAndSessionDataUseCase,
    @inject("IGetRevenueReportUseCase") private getRevenueReportUseCase: IGetRevenueReportUseCase,
    @inject("IGetSessionReportUseCase") private getSessionReportUseCase: IGetSessionReportUseCase
  ) {}

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const stats = await this.getDashboardStatsUseCase.execute(year);
      res.status(HTTP_STATUS.OK).json(stats);
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }

  async getTopPerformingTrainers(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const trainers = await this.getTopPerformingTrainersUseCase.execute(limit);
      res.status(HTTP_STATUS.OK).json(trainers);
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }

  async getPopularWorkouts(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const workouts = await this.getPopularWorkoutsUseCase.execute(limit);
      res.status(HTTP_STATUS.OK).json(workouts);
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }

  async getUserAndSessionData(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const type = (req.query.type as "daily" | "weekly") || "daily";
      const data = await this.getUserAndSessionDataUseCase.execute(year, type);
      res.status(HTTP_STATUS.OK).json(data);
    } catch (error) {
     handleErrorResponse(req,res, error);
    }
  }

  async exportRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await this.getRevenueReportUseCase.execute(year);
      const fields = ["month", "totalRevenue", "totalTrainerEarnings", "totalProfit"];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      res.header("Content-Type", "text/csv");
      res.attachment(`revenue_report_${year}.csv`);
      res.send(csv);
    } catch (error) {
     handleErrorResponse(req,res, error);
    }
  }

  async exportSessionReport(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await this.getSessionReportUseCase.execute(year);
      const fields = ["date", "totalSessions", "uniqueClientsCount"];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      res.header("Content-Type", "text/csv");
      res.attachment(`session_report_${year}.csv`);
      res.send(csv);
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }
}
