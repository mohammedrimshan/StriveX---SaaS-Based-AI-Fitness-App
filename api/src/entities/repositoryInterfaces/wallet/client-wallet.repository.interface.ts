import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";
import { IBaseRepository } from "../base-repository.interface";
import { ClientSession } from "mongoose";
import { IWalletTransactionEntity } from "@/entities/models/wallet-transaction.entity";

export interface IClientWalletRepository extends IBaseRepository<IClientWalletEntity> {
  findByClientId(clientId: string): Promise<IClientWalletEntity | null>;
  updateBalance(clientId: string, amount: number, session?: ClientSession): Promise<IClientWalletEntity | null>;
  getWalletTransactionSummary(
    clientId: string,
    year: number,
    month: number,
    skip: number,
    limit: number
  ): Promise<{
    monthlyTransactionCount: number;
    totalTransactionCount: number;
    totalTransactionAmount: number;
    transactions: IWalletTransactionEntity[];
    transactionTotal: number;
  }>;
}