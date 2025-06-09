import { IClientFeedback, IClientProgress, IEarningsReport, ISessionHistory, ITrainerDashboardStats, IUpcomingSession, IWeeklySessionStats } from "@/entities/models/trainer-dashboard.entity";

export interface ITrainerDashboardRepository {
  getDashboardStats(trainerId: string, year: number, month: number): Promise<ITrainerDashboardStats>;
  getUpcomingSessions(trainerId: string, limit?: number): Promise<IUpcomingSession[]>;
  getWeeklySessionStats(trainerId: string, year: number, month: number): Promise<IWeeklySessionStats[]>;
  getClientFeedback(trainerId: string, limit?: number): Promise<IClientFeedback[]>;
  getEarningsReport(trainerId: string, year: number, month: number): Promise<IEarningsReport>;
  getClientProgress(trainerId: string, limit?: number): Promise<IClientProgress[]>;
  getSessionHistory(trainerId: string, filters: { date?: string; clientId?: string; status?: string }): Promise<ISessionHistory[]>;
}