import { RoleType } from "@/shared/constants";

export interface IReport {
  userId: string;
  reason: string;
  reportedAt: Date;
}

export interface IPostEntity {
  id: string;
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
  author?: {
    _id: string; 
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    
  } | null;
}