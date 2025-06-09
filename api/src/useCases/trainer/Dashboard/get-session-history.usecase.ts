import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { IGetTrainerSessionHistoryUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-session-history.usecase.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetTrainerSessionHistoryUseCase implements IGetTrainerSessionHistoryUseCase {
  constructor(
    @inject("ITrainerDashboardRepository") private repository: ITrainerDashboardRepository
  ) {}

  async execute(
    trainerId: string,
    filters: { date?: string; clientId?: string; status?: string }
  ): Promise<any> {
    return await this.repository.getSessionHistory(trainerId, filters);
  }
}