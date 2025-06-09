export interface IGetClientFeedbackUseCase {
  execute(trainerId: string, limit?: number): Promise<any>;
}
