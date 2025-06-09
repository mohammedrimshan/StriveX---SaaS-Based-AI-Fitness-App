export interface IGetUpcomingSessionsUseCase {
  execute(trainerId: string, limit?: number): Promise<any>;
}
