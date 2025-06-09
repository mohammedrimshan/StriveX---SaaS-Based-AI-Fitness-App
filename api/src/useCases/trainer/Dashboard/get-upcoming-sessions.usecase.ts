import { injectable, inject } from "tsyringe";
import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { IGetUpcomingSessionsUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-upcoming-sessions.usecase.interface";

@injectable()
export class GetUpcomingSessionsUseCase implements IGetUpcomingSessionsUseCase {
  constructor(
    @inject("ITrainerDashboardRepository") private repository: ITrainerDashboardRepository
  ) {}

  async execute(trainerId: string, limit: number = 5): Promise<any> {
    return await this.repository.getUpcomingSessions(trainerId, limit);
  }
}