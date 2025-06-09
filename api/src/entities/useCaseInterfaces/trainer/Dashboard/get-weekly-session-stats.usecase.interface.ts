export interface IGetWeeklySessionStatsUseCase {
  execute(trainerId: string, year: number, month: number): Promise<any>;
}
