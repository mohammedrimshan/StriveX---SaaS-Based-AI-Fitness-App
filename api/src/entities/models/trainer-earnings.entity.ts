
export interface ITrainerEarningsEntity {
  id?: string;
  slotId: string;
  trainerId: string;
  clientId: string;
  membershipPlanId: string;
  amount: number;
  trainerShare: number;
  adminShare: number;
  createdAt: Date;
  completedAt: Date;
}