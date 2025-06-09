import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { IGetClientProgressUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-client-progress.usecase.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetClientProgressUseCase implements IGetClientProgressUseCase {
  constructor(
    @inject("ITrainerDashboardRepository") private repository: ITrainerDashboardRepository
  ) {}

  async execute(trainerId: string, limit: number = 3): Promise<any> {
    return await this.repository.getClientProgress(trainerId, limit);
  }
}