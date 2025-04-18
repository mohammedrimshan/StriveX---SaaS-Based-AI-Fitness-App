export interface IEventRepository {
    isProcessed(eventId: string): Promise<boolean>;
    markAsProcessed(eventId: string): Promise<void>;
  }