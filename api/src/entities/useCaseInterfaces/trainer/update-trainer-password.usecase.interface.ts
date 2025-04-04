export interface IUpdateTrainerPasswordUseCase {
    execute(id: any, current: string, newPassword: string): Promise<void>;
  }
  