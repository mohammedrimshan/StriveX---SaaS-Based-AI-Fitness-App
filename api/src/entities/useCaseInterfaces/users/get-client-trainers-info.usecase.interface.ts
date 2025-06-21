export interface IGetClientTrainersInfoUseCase {
  execute(clientId: string): Promise<{
    selectedTrainer: any;
    backupTrainer: any;
  }>;
}