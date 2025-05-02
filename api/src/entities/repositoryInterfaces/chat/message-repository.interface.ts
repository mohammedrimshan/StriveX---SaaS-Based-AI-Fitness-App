import { IMessageEntity } from "@/entities/models/message.entity";
import { IBaseRepository } from "@/entities/repositoryInterfaces/base-repository.interface"; // Adjust import path

export interface IMessageRepository extends IBaseRepository<IMessageEntity> {
  getConversation(
    user1Id: string,
    user2Id: string,
    skip: number,
    limit: number
  ): Promise<{ items: IMessageEntity[]; total: number }>;

  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;

  getUnreadCount(receiverId: string, senderId?: string): Promise<number>;

  getRecentChats(
    userId: string,
    limit: number
  ): Promise<Array<{
    userId: string;
    lastMessage: IMessageEntity;
    unreadCount: number;
    participantName?: string;
    participantAvatar?: string
  }>>;
}
