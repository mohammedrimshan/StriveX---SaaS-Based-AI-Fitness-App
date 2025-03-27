export interface IUpdateClientPasswordUseCase {
    execute(id: any, current: string, newPassword: string): Promise<void>;
  }
  