import { RoleType } from "./PostDetials/PostDetialHeader";

export interface IReport {
  userId: string;
  reason: string;
  reportedAt: Date;
}

export interface IAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  role?: RoleType;
  category?: string; 
}

export interface IPostEntity {
  id?: string;
  authorId: string;
  role: RoleType;
  textContent: string;
  mediaUrl?: string;
  category: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  reports: IReport[];
  commentsCount?: number;
  author?: IAuthor | null;
}

export interface ICommentEntity {
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

export interface IClientEntity {
  id?: string;
  name?: string;
}