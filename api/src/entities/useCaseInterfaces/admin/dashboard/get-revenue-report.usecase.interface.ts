import { IRevenueReport } from "@/entities/models/admin-dashboard.entity";

export interface IGetRevenueReportUseCase {
  execute(year: number): Promise<IRevenueReport[]>;
}