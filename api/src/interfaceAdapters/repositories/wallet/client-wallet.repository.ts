import { injectable } from "tsyringe";
import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";
import { ClientWalletModel } from "@/frameworks/database/mongoDB/models/client-wallet.model";
import { BaseRepository } from "../base.repository";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";

@injectable()
export class ClientWalletRepository
  extends BaseRepository<IClientWalletEntity>
  implements IClientWalletRepository
{
  constructor() {
    super(ClientWalletModel);
  }

  async findByClientId(clientId: string): Promise<IClientWalletEntity | null> {
    return this.findOneAndMap({ clientId });
  }

 async updateBalance(clientId: string, amount: number): Promise<IClientWalletEntity | null> {
  const wallet = await this.findByClientId(clientId);
  console.log(wallet, "wallet from repo");

  // Calculate new balance: if wallet doesn't exist, start from 0
  const newBalance = (wallet?.balance || 0) + amount;
  console.log(newBalance, "newBalance");

  // Update wallet balance or create new wallet if none exists
  return this.findOneAndUpdateAndMap(
    { clientId },                 // filter
    { balance: newBalance },      // update
    { upsert: true, new: true }   // options: create if not found, return updated doc
  );
}
}
