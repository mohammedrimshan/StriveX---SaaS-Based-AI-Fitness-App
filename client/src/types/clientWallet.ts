export interface IWalletTransaction {
  id: string;
  amount: number;
  type: "REFUND" | "WITHDRAWAL" | "DEPOSIT" | string; 
  reason: string;
  createdAt: string;
}

export interface IClientWallet {
  id: string;
  clientId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWalletDetailsResponse {
  wallet: IClientWallet;
  monthlyTransactionCount: number;
  totalTransactionCount: number;
  totalTransactionAmount: number;
  transactions: IWalletTransaction[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
}
