import { injectable, inject } from "tsyringe";
import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { IGetTrainerDashboardStatsUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-dashboard-stats.usecase.interface";

@injectable()
export class GetTrainerDashboardStatsUseCase implements IGetTrainerDashboardStatsUseCase {
  constructor(
    @inject("ITrainerDashboardRepository") private repository: ITrainerDashboardRepository
  ) {}

  async execute(trainerId: string, year: number, month: number): Promise<any> {
    return await this.repository.getDashboardStats(trainerId, year, month);
  }
}
