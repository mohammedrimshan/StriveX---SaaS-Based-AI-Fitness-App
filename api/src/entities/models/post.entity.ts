import { RoleType } from "@/shared/constants";
import { IClientEntity } from "./client.entity";

export interface IReport {
  userId: string;
  reason: string;
  reportedAt: Date;
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
  author?: {
    _id: string; // Expects a non-nullable string
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  } | null;
}