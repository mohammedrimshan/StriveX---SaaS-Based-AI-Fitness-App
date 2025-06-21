import { model } from "mongoose";
import { IWalletTransactionEntity } from "@/entities/models/wallet-transaction.entity";
import { walletTransactionSchema } from "../schemas/wallet-transaction.schema";

export const WalletTransactionModel = model<IWalletTransactionEntity>(
  "WalletTransaction",
  walletTransactionSchema
);