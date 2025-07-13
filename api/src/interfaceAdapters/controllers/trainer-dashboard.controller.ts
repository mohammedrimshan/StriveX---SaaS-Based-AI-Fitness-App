import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IGetTrainerDashboardStatsUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-dashboard-stats.usecase.interface";
import { IGetUpcomingSessionsUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-upcoming-sessions.usecase.interface";
import { IGetWeeklySessionStatsUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-weekly-session-stats.usecase.interface";
import { IGetClientFeedbackUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-client-feedback.usecase.interface";
import { IGetEarningsReportUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-earnings-report.usecase.interface";
import { IGetClientProgressUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-client-progress.usecase.interface";
import { IGetTrainerSessionHistoryUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-session-history.usecase.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";

@injectable()
export class TrainerDashboardController {
  constructor(
    @inject("IGetTrainerDashboardStatsUseCase") private getDashboardStatsUseCase: IGetTrainerDashboardStatsUseCase,
    @inject("IGetUpcomingSessionsUseCase") private getUpcomingSessionsUsecase: IGetUpcomingSessionsUseCase,
    @inject("IGetWeeklySessionStatsUseCase") private getWeeklySessionStatsUsecase: IGetWeeklySessionStatsUseCase,
    @inject("IGetClientFeedbackUseCase") private getClientFeedbackUsecase: IGetClientFeedbackUseCase,
    @inject("IGetEarningsReportUseCase") private getEarningsReportUsecase: IGetEarningsReportUseCase,
    @inject("IGetClientProgressUseCase") private getClientProgressUsecase: IGetClientProgressUseCase,
    @inject("IGetTrainerSessionHistoryUseCase") private getSessionHistoryUsecase: IGetTrainerSessionHistoryUseCase
  ) {}

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const { year, month } = req.query;
      const stats = await this.getDashboardStatsUseCase.execute(
        trainerId,
        parseInt(year as string),
        parseInt(month as string)
      );
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getUpcomingSessions(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const { limit } = req.query;
      const sessions = await this.getUpcomingSessionsUsecase.execute(trainerId, parseInt(limit as string));
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getWeeklySessionStats(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const { year, month } = req.query;
      const stats = await this.getWeeklySessionStatsUsecase.execute(
        trainerId,
        parseInt(year as string),
        parseInt(month as string)
      );
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getClientFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const { limit } = req.query;
      const feedback = await this.getClientFeedbackUsecase.execute(trainerId, parseInt(limit as string));
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getEarningsReport(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const { year, month } = req.query;
      const report = await this.getEarningsReportUsecase.execute(
        trainerId,
        parseInt(year as string),
        parseInt(month as string)
      );
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getClientProgress(req: Request, res: Response): Promise<void> {
  try {
    const { trainerId } = req.params;
    const limitParam = req.query.limit as string;

    // Fallback to default value (3) if limit is invalid or missing
    const limit = Number.isNaN(parseInt(limitParam)) ? 3 : parseInt(limitParam);

    const progress = await this.getClientProgressUsecase.execute(trainerId, limit);
    res.status(200).json(progress);
  } catch (error) {
    handleErrorResponse(req,res, error);
  }
}


  async getSessionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const { date, clientId, status } = req.query;
      const history = await this.getSessionHistoryUsecase.execute(trainerId, {
        date: date as string,
        clientId: clientId as string,
        status: status as string
      });
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
