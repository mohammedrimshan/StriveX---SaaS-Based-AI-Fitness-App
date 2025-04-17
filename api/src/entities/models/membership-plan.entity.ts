export interface IMembershipPlanEntity {
    id: string;
    name: string;
    durationMonths: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }