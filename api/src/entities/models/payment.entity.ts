import { PaymentStatus } from "@/shared/constants";

export interface IPaymentEntity {
    id?: string;
    userId: string;
    trainerId?: string;
    membershipPlanId: string;
    amount: number;
    stripePaymentId: string;
    trainerAmount?: number;
    adminAmount: number;
    status: PaymentStatus;
    createdAt: Date;
  }