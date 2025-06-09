import { TrainerApprovalStatus } from "@/shared/constants";

export interface IReviewEntity {
  id?: string;
  clientId: string;
  trainerId: string;
  rating: number; 
  comment?: string;
  clientProfileImage?: string;
  clientName: string;
  createdAt: Date;
  updatedAt: Date;
}