export interface User {
    id: string;
    name: string;
    avatar: string;
    status: "online" | "offline";
    lastSeen?: string;
  }
  
  export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    read: boolean;
    replyTo?: string;
    media?: {
      type: "image" | "video" | "file";
      url: string;
      name?: string;
      size?: number;
      width?: number;
      height?: number;
    };
    reactions?: {
      emoji: string;
      users: string[];
    }[];
  }
  
  export interface Chat {
    id: string;
    participants: User[];
    messages: Message[];
    unreadCount: number;
  }
  
  export interface TypingIndicator {
    userId: string;
    chatId: string;
    timestamp: Date;
  }
  