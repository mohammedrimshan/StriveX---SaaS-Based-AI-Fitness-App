import { MessageStatus } from "@/shared/constants";

export interface IMessageEntity {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  readAt?: Date;
  mediaUrl?: string;
  mediaType?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  replyToId?: string;
  reactions?: Array<{ userId: string; emoji: string }>;
  senderName?: string;
  senderAvatar?: string;
  senderStatus?: "online" | "offline";
  receiverName?: string;
  receiverAvatar?: string;
  receiverStatus?: "online" | "offline";
}