import { IAuthor } from "@/components/Community"
import { RoleType } from "@/components/Community/PostDetials/PostDetialHeader"

export type UserRole = 'client' | 'trainer' | 'admin'

export interface IReport {
  userId: string
  reason: string
  reportedAt: Date
}

export interface IPostAuthor {
  _id: string
  firstName: string
  lastName: string
  email: string
  profileImage?: string
  isTrainer?: boolean
   id: string;
  name?: string;
  avatarUrl?: string; 
}

export interface IPost {
  id: string;
  authorId: string;
  author?: IPostAuthor | null;
  textContent: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  commentCount: number;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrl?: string;
  role?: string;
  isDeleted?: boolean;
  hasLiked?: boolean;
  reports?: IReport[];
  total?: number;
}


export interface IComment {
  id?: string;
  postId: string;
  authorId: string;
  role: RoleType;
  textContent: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  reports: IReport[];
  author?: IAuthor | null;
}
export interface PaginatedPostsResponse {
  items: IPost[];
  total: number;
  currentSkip: number;
  limit: number;
}