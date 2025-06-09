
import { injectable, inject } from "tsyringe";
import { IAdminDashboardRepository } from "@/entities/repositoryInterfaces/admin/admin-dashboard-repository.interface";
import { ITopTrainer } from "@/entities/models/admin-dashboard.entity";
import { IGetTopPerformingTrainersUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-top-performing-trainer.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetTopPerformingTrainersUseCase implements IGetTopPerformingTrainersUseCase {
  constructor(
    @inject("IAdminDashboardRepository") private repository: IAdminDashboardRepository
  ) {}

  async execute(limit: number = 5): Promise<ITopTrainer[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new CustomError("Invalid limit provided", HTTP_STATUS.BAD_REQUEST);
    }
    return await this.repository.getTopPerformingTrainers(limit);
  }
}
