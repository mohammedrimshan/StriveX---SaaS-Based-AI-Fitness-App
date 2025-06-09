export interface IGetClientProgressUseCase {
  execute(trainerId: string, limit?: number): Promise<any>;
}
