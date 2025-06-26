import { injectable, inject } from "tsyringe";
import { IGetClientWalletDetailsUseCase } from "@/entities/useCaseInterfaces/wallet/get-client-wallet-details-usecase.interface";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";
import { IWalletTransactionEntity } from "@/entities/models/wallet-transaction.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetClientWalletDetailsUseCase implements IGetClientWalletDetailsUseCase {
  constructor(
    @inject("IClientWalletRepository") private _walletRepository: IClientWalletRepository
  ) {}

  async execute(
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
  }> {
    if (!clientId || typeof clientId !== "string") {
      throw new CustomError(ERROR_MESSAGES.INVALID_CLIENT_ID, HTTP_STATUS.BAD_REQUEST);
    }
    if (month < 1 || month > 12) {
      throw new CustomError("Invalid month", HTTP_STATUS.BAD_REQUEST);
    }
    if (skip < 0 || limit < 1) {
      throw new CustomError("Invalid pagination parameters", HTTP_STATUS.BAD_REQUEST);
    }

    const [wallet, transactionSummary] = await Promise.all([
      this._walletRepository.findByClientId(clientId),
      this._walletRepository.getWalletTransactionSummary(clientId, year, month, skip, limit),
    ]);

    if (!wallet) {
      throw new CustomError(ERROR_MESSAGES.WALLET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      wallet,
      monthlyTransactionCount: transactionSummary.monthlyTransactionCount,
      totalTransactionCount: transactionSummary.totalTransactionCount,
      totalTransactionAmount: transactionSummary.totalTransactionAmount,
      transactions: {
        items: transactionSummary.transactions,
        total: transactionSummary.transactionTotal,
      },
    };
  }
}