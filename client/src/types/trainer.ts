export interface TrainerProfileType {
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
    items: Review[];
    averageRating: number;
    totalReviewCount: number;
    canReview: boolean;
  };
  performanceStats: {
    sessionsCompleted: number;
    clientsTrained: number;
    successRate?: number;
  };
  availableSlots: Slot[];
}

export interface Review {
  id?: string;
  clientId: string;
  trainerId: string;
  rating: number;
  comment?: string;
  clientProfileImage?: string;
  clientName: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Slot {
  slotId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface ReviewInput {
  clientId: string;
  trainerId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  reviewId: string;
  clientId: string;
  trainerId?:string;
  rating: number;
  comment?: string;
}
