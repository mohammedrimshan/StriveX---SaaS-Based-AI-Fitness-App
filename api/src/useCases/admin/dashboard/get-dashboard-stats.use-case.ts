
import { injectable, inject } from "tsyringe";
import { IAdminDashboardRepository } from "@/entities/repositoryInterfaces/admin/admin-dashboard-repository.interface";
import { IDashboardStats } from "@/entities/models/admin-dashboard.entity";
import { IGetDashboardStatsUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/getdashboard-stats.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetDashboardStatsUseCase implements IGetDashboardStatsUseCase {
  constructor(
    @inject("IAdminDashboardRepository") private repository: IAdminDashboardRepository
  ) {}

  async execute(year: number): Promise<IDashboardStats> {
    if (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear()) {
      throw new CustomError("Invalid year provided", HTTP_STATUS.BAD_REQUEST);
    }
    return await this.repository.getDashboardStats(year);
  }
}
