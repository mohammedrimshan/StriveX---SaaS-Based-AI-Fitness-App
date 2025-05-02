export interface IValidateChatPermissionsUseCase {
    execute(userId: string, role: string, targetId: string): Promise<void>;
  }