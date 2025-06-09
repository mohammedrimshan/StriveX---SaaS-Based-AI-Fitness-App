
import { IDashboardStats, IPopularWorkout, IRevenueReport, ISessionReport, ITopTrainer, IUserAndSessionData } from "@/entities/models/admin-dashboard.entity";

export interface IAdminDashboardRepository {
  getDashboardStats(year: number): Promise<IDashboardStats>;
  getTopPerformingTrainers(limit?: number): Promise<ITopTrainer[]>;
  getPopularWorkouts(limit?: number): Promise<IPopularWorkout[]>;
  getUserAndSessionData(year: number, type?: "daily" | "weekly"): Promise<IUserAndSessionData>;
  getRevenueReport(year: number): Promise<IRevenueReport[]>;
  getSessionReport(year: number): Promise<ISessionReport[]>;
}
