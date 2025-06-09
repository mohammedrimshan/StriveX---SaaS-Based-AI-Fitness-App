import { IDashboardStats } from "@/entities/models/admin-dashboard.entity";

export interface IGetDashboardStatsUseCase {
  execute(year: number): Promise<IDashboardStats>;
}
