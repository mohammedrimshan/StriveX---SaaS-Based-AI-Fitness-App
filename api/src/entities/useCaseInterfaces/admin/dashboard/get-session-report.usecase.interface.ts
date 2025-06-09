import { ISessionReport } from "@/entities/models/admin-dashboard.entity";

export interface IGetSessionReportUseCase {
  execute(year: number): Promise<ISessionReport[]>;
}