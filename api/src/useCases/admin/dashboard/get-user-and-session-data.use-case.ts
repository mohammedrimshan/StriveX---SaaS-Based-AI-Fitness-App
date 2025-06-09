
import { injectable, inject } from "tsyringe";
import { IAdminDashboardRepository } from "@/entities/repositoryInterfaces/admin/admin-dashboard-repository.interface";
import { IUserAndSessionData } from "@/entities/models/admin-dashboard.entity";
import { IGetUserAndSessionDataUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-user-and-session-data.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetUserAndSessionDataUseCase implements IGetUserAndSessionDataUseCase {
  constructor(
    @inject("IAdminDashboardRepository") private repository: IAdminDashboardRepository
  ) {}

  async execute(year: number, type: "daily" | "weekly" = "daily"): Promise<IUserAndSessionData> {
    if (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear()) {
      throw new CustomError("Invalid year provided", HTTP_STATUS.BAD_REQUEST);
    }
    if (!["daily", "weekly"].includes(type)) {
      throw new CustomError("Invalid type provided", HTTP_STATUS.BAD_REQUEST);
    }
    return await this.repository.getUserAndSessionData(year, type);
  }
}
