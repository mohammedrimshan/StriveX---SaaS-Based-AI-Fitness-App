import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { IGetEarningsReportUseCase } from "@/entities/useCaseInterfaces/trainer/Dashboard/get-earnings-report.usecase.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetEarningsReportUseCase implements IGetEarningsReportUseCase {
  constructor(
    @inject("ITrainerDashboardRepository") private repository: ITrainerDashboardRepository
  ) {}

  async execute(trainerId: string, year: number, month: number): Promise<any> {
    return await this.repository.getEarningsReport(trainerId, year, month);
  }
}
