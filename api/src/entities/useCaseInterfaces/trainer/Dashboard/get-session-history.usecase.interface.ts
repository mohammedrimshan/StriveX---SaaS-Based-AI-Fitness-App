export interface IGetTrainerSessionHistoryUseCase {
  execute(
    trainerId: string,
    filters: { date?: string; clientId?: string; status?: string }
  ): Promise<any>;
}
