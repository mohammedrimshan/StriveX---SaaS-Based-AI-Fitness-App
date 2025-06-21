import { Schema } from "mongoose";
import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";

export const clientWalletSchema = new Schema<IClientWalletEntity>(
  {
    clientId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

clientWalletSchema.index({ clientId: 1 }, { unique: true });