export interface TransactionData {
  id: string;
  clientId: string;
  userName: string;
  membershipPlanId: string;
  planName: string;
  amount: number;
  stripeSessionId: string;
  trainerAmount: number;
  adminAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  stripePaymentId?: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  transactions: TransactionData[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
}

export interface FetchTransactionsParams {
  page?: number;
  limit?: number;
  userId?: string;
  role?: "client" | "trainer";
  search?: string;
  status:string
}