import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";
import { IBaseRepository } from "../base-repository.interface";
import { ClientSession } from "mongoose";

export interface IClientWalletRepository extends IBaseRepository<IClientWalletEntity> {
  findByClientId(clientId: string): Promise<IClientWalletEntity | null>;
  updateBalance(clientId: string, amount: number, session?: ClientSession): Promise<IClientWalletEntity | null>;
}