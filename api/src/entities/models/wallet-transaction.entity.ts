import { WalletTransactionType } from "@/shared/constants";


export interface IWalletTransactionEntity {
  id?: string;
  clientId: string;
  amount: number;
  type: WalletTransactionType;
  reason: string;
  createdAt: Date;
}