
import { injectable, inject } from "tsyringe";
import { IAdminDashboardRepository } from "@/entities/repositoryInterfaces/admin/admin-dashboard-repository.interface";
import { IRevenueReport } from "@/entities/models/admin-dashboard.entity";
import { IGetRevenueReportUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-revenue-report.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetRevenueReportUseCase implements IGetRevenueReportUseCase {
  constructor(
    @inject("IAdminDashboardRepository") private repository: IAdminDashboardRepository
  ) {}

  async execute(year: number): Promise<IRevenueReport[]> {
    if (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear()) {
      throw new CustomError("Invalid year provided", HTTP_STATUS.BAD_REQUEST);
    }
    return await this.repository.getRevenueReport(year);
  }
}
