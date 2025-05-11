import { IReport } from "@/services/client/clientService";

export type User = {
  id: string;
  name: string;
  avatarUrl?: string; // Optional, as avatar might not always be available
  preferredWorkout?: string;
  specialization?: string;
  isTrainer: boolean;
  email?: string; // Add email for compatibility with IPostAuthor
  firstName?: string; // Add for compatibility with IPostAuthor
  lastName?: string; // Add for compatibility with IPostAuthor
  role?: string; // Add for compatibility with IPostAuthor
};

export type Comment = {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
  hasLiked: boolean;
};

export type Post = {
  id: string;
  authorId: string;
  author?: User; // Make optional to handle undefined cases
  textContent: string; // Use textContent instead of content
  mediaUrl?: string; // Use mediaUrl instead of imageUrl/videoUrl
  category: string;
  likes: string[]; // Use array of user IDs instead of number
  comments: Comment[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  reports: IReport[];
  role: string;
  hasLiked: boolean; // Keep for UI state
};