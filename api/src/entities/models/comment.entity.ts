import { IReport } from "./post.entity";
import { RoleType } from "@/shared/constants";
export interface ICommentEntity {
    id?: string;
    postId: string;
    authorId: string;
    role: RoleType
    textContent: string;
    likes: string[];
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    reports: IReport[];
  }