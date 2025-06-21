import { model } from "mongoose";
import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";
import { clientWalletSchema } from "../schemas/client-wallet.schema";

export const ClientWalletModel = model<IClientWalletEntity>(
  "ClientWallet",
  clientWalletSchema
);