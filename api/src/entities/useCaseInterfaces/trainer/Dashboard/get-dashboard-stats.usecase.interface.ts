export interface IGetTrainerDashboardStatsUseCase {
  execute(trainerId: string, year: number, month: number): Promise<any>;
}
