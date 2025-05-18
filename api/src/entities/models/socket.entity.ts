import { MessageStatus, RoleType, WorkoutType } from "@/shared/constants";
import { Socket } from "socket.io";

export interface UserSocket extends Socket {
  userId?: string;
  role?: RoleType;
}

export interface FrontendMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  status: MessageStatus;
  timestamp: string;
  media?: { type: string; url: string; name?: string };
  replyToId?: string;
  reactions: { userId: string; emoji: string }[];
  deleted: boolean;
  readAt?: string;
}

export interface FrontendPost {
  id: string;
  authorId: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    isTrainer?: boolean;
  } | null;
  role: RoleType;
  textContent: string;
  mediaUrl?: string;
  category: WorkoutType;
  likes: string[];
  commentsCount: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface FrontendComment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  } | null;
  textContent: string;
  likes: string[];
  isDeleted: boolean;
  createdAt: string;
}
