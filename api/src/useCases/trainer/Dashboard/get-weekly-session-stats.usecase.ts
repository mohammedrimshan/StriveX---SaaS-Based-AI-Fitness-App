import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { IGetWeeklySessionStatsUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-weekly-session-stats.usecase.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetWeeklySessionStatsUseCase implements IGetWeeklySessionStatsUseCase {
  constructor(
    @inject("ITrainerDashboardRepository") private repository: ITrainerDashboardRepository
  ) {}

  async execute(trainerId: string, year: number, month: number): Promise<any> {
    return await this.repository.getWeeklySessionStats(trainerId, year, month);
  }
}
