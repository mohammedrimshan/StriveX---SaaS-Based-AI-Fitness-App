export interface IDeleteMessageUseCase {
    execute(messageId: string, userId: string): Promise<void>;
  }