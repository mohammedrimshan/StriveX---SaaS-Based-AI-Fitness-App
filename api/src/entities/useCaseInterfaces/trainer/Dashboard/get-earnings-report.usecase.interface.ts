export interface IGetEarningsReportUseCase {
  execute(trainerId: string, year: number, month: number): Promise<any>;
}
