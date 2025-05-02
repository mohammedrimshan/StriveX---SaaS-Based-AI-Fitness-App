export interface IMessage {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
    readAt?: string;
    media?: {
      type: 'image' | 'video' | 'file';
      url: string;
    };
    mediaType?: 'image' | 'video' | 'file' | null;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    replyToId?: string;
    reactions?: Array<{ userId: string; emoji: string }>;
    _fromSocket?: boolean;
  }
  
  export interface IChatParticipant {
    userId: string;
    role: 'client' | 'trainer' | 'admin';
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    isOnline: boolean;
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

 