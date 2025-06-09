import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { IGetClientFeedbackUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-client-feedback.usecase.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetClientFeedbackUseCase implements IGetClientFeedbackUseCase {
  constructor(
    @inject("ITrainerDashboardRepository") private repository: ITrainerDashboardRepository
  ) {}

  async execute(trainerId: string, limit: number = 5): Promise<any> {
    return await this.repository.getClientFeedback(trainerId, limit);
  }
}
