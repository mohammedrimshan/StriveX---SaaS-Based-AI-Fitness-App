import { PaymentStatus } from "@/shared/constants";

export interface IPaymentEntity {
  id?: string;
  clientId: string; // Changed from userId to clientId
  trainerId?: string;
  membershipPlanId: string;
  amount: number;
  stripePaymentId?: string;
  stripeSessionId: string;
  trainerAmount?: number; // Added to store 80% for trainer
  adminAmount: number; // Store 20% for admin
  status: PaymentStatus;
  createdAt: Date;
}