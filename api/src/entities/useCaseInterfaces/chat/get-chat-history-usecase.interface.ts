import { IMessageEntity } from "@/entities/models/message.entity";

export interface IGetChatHistoryUseCase {
  execute(user1Id: string, user2Id: string, page: number, limit: number): Promise<{
    items: IMessageEntity[];
    total: number;
  }>;
}