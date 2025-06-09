import { IReviewEntity } from "@/entities/models/review.entity";

export interface TrainerProfileViewDto {
  trainer: {
    id: string;
    fullName: string;
    profileImage?: string;
    experience?: number;
    gender?: string;
    age?: number;
    skills?: string[];
    certifications?: string[];
  };
  reviews: {
    items: IReviewEntity[];
    averageRating: number;
    totalReviewCount: number;
    canReview: boolean;
  };
  performanceStats: {
    sessionsCompleted: number;
    clientsTrained: number;
    successRate?: number;
  };
  availableSlots: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}
