// D:\StriveX\client\src\types\Chat.ts

export interface IMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  text: string;
  status: "SENT" | "DELIVERED" | "READ";
  readAt?: string;
  media?: {
    type: "video" | "image" | "file" | "audio";
    url: string;
    name?: string;
  };

  mediaType?: "image" | "video" | "file" | "audio" | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  replyToId?: string;
  reactions?: Array<{ users: string; userId: string; emoji: string }>; // Align with socketContext.tsx
  _fromSocket?: boolean;
  timestamp?: string;
  tempId?: string;
}

export interface IChatParticipant {
  id: string; // Add id
  userId: string;
  name?: string; // Add name
  role: "client" | "trainer" | "admin";
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  isOnline: boolean;
  status?: "online" | "offline"; // Add status
  lastSeen?: string;
}

export interface IChat {
  chatId: string;
  participant: IChatParticipant;
  lastMessage?: IMessage;
  unreadCount: number;
}

export interface ChatHistoryResponse {
  success: boolean;
  messages: IMessage[];
  totalMessages: number;
  currentPage: number;
  totalPages: number;
}

export interface RecentChatsResponse {
  success: boolean;
  chats: IChat[];
  totalChats: number;
}

export interface ChatParticipantsResponse {
  success: boolean;
  participants: IChatParticipant[];
  totalParticipants: number;
}

export interface ExtendedMessage extends IMessage {
  receiverName?: string;
  senderName?: string;
}

export interface Participant {
  id: string;
  userId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status?: "online" | "offline";
  isOnline?: boolean;
  email?: string;
  role?: "client" | "trainer" | "admin";
}

export interface ChatMessageProps {
  message: ExtendedMessage;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "client" | "trainer" | "admin";
    isOnline: boolean;
    avatar: string;
  };
  isCurrentUser: boolean;
  onReply: () => void;
  localMessages: ExtendedMessage[];
  participants: Participant[];
  showAvatar: boolean;
}

export interface RawParticipant {
  id?: string;
  userId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "client" | "trainer" | "admin";
  isOnline?: boolean;
  status?: "online" | "offline";
  avatar?: string;
  lastSeen?: string;
}
