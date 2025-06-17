
export interface IGetUserSubscriptionsUseCase {
  execute(params: {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | "active" | "expired";
  }): Promise<{
    items: {
      clientId: string;
      clientName: string;
      profileImage?: string;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
      isExpired: boolean;
      daysUntilExpiration: number;
      membershipPlanId?: string;
      planName?: string;
      amount?: number;
      status: string;
    }[];
    total: number;
  }>;
}