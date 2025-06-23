import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";
import { IWalletTransactionEntity } from "@/entities/models/wallet-transaction.entity";

export interface IGetClientWalletDetailsUseCase {
  execute(
    clientId: string,
    year: number,
    month: number,
    skip: number,
    limit: number
  ): Promise<{
    wallet: IClientWalletEntity | null;
    monthlyTransactionCount: number;
    totalTransactionCount: number;
    totalTransactionAmount: number;
    transactions: {
      items: IWalletTransactionEntity[];
      total: number;
    };
  }>;
}