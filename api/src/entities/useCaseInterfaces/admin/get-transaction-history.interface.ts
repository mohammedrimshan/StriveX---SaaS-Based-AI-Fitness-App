export interface IGetTransactionHistoryUseCase {
  execute(params: {
    userId?: string;
    role?: "client" | "trainer";
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "completed" | "pending"; 
  }): Promise<{
    items: {
      id: string;
      clientId: string;
      userName?: string;
      membershipPlanId: string;
      planName?: string;
      amount: number;
      stripeSessionId: string;
      trainerAmount?: number;
      adminAmount: number;
      status: string;
      createdAt: string;
      updatedAt?: string;
      stripePaymentId?: string;
    }[];
    total: number;
  }>;
}