export interface WalletRecord {
  id: string;
  clientName: string;
  planTitle: string;
  amount: number;
  trainerAmount: number;
  adminShare: number;
  completedAt: string;
  status?: string;
}

export interface WalletStatistics {
  totalEarnings: number;
  totalTransactions: number;
  currentMonthEarnings: number;
  currentMonthTransactions: number;
}


// Interface for a single wallet history item
export interface WalletHistoryItem {
  id: string;
  clientId: string;
  trainerId: string;
  membershipPlanId: string;
  amount: number;
  stripePaymentId: string;
  stripeSessionId: string;
  trainerAmount: number;
  status: string;
  completedAt: string;
  updatedAt: string;
  clientName: string;
  planTitle: string;
  adminShare: number;
}

// Interface for paginated wallet history response
export interface WalletHistoryResponse {
  success: boolean;
  data: {
    items: WalletHistoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}