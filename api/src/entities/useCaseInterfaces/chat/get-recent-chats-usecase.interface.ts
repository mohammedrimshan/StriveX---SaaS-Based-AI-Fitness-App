import { IMessageEntity } from "@/entities/models/message.entity";

export interface IGetRecentChatsUseCase {
  execute(userId: string, limit: number): Promise<Array<{
    userId: string;
    lastMessage: IMessageEntity;
    unreadCount: number;
    participants: Array<{
      id: string;
      name: string;
      avatar: string;
      status: "online" | "offline";
    }>;
  }>>;
}