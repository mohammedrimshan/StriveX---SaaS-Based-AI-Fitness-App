// types/community.ts
export type UserRole = 'client' | 'trainer' | 'admin';

export interface IReport {
  userId: string;
  reason: string;
  reportedAt: Date;
}

export interface IPostAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  isTrainer?: boolean;
}

export interface IPost {
  id: string;
  authorId: string;
  role: UserRole;
  textContent: string;
  mediaUrl?: string;
  category: string;
  likes: string[];
  hasLiked?: boolean;
  commentCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  isDeleted?: boolean;
  reports?: IReport[];
  author?: IPostAuthor | null;
}

export interface IComment {
  id: string;
  postId: string;
  authorId: string;
  role: UserRole;
  textContent: string;
  likes: string[];
  createdAt: Date | string;
  updatedAt?: Date | string;
  isDeleted?: boolean;
  reports?: IReport[];
  author?: IPostAuthor | null;
}

export interface PaginatedPostsResponse {
  items: IPost[];
  total: number;
  currentSkip: number;
  limit: number;
}