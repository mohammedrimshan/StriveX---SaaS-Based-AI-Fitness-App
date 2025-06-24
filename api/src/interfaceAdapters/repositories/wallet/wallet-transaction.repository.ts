import { injectable } from "tsyringe";
import { IWalletTransactionEntity } from "@/entities/models/wallet-transaction.entity";
import { WalletTransactionModel } from "@/frameworks/database/mongoDB/models/wallet-transaction.model";
import { BaseRepository } from "../base.repository";
import { IWalletTransactionRepository } from "@/entities/repositoryInterfaces/wallet/wallet-transaction.repository.interface";

@injectable()
export class WalletTransactionRepository
  extends BaseRepository<IWalletTransactionEntity>
  implements IWalletTransactionRepository
{
  constructor() {
    super(WalletTransactionModel);
  }
async deleteByReason(reason: string): Promise<void> {
  await WalletTransactionModel.deleteMany({ reason });
}
}
