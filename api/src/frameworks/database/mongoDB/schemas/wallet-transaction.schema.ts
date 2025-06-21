import { Schema } from "mongoose";
import { IWalletTransactionEntity } from "@/entities/models/wallet-transaction.entity";
import { WalletTransactionType } from "@/shared/constants";

export const walletTransactionSchema = new Schema<IWalletTransactionEntity>(
  {
    clientId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: Object.values(WalletTransactionType), required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ clientId: 1, createdAt: 1 });