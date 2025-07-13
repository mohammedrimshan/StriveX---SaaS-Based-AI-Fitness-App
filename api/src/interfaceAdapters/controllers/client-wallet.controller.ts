import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IClientWalletController } from "@/entities/controllerInterfaces/client-wallet-controller.interface";
import { IGetClientWalletDetailsUseCase } from "@/entities/useCaseInterfaces/wallet/get-client-wallet-details-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomRequest } from "@/interfaceAdapters/middlewares/auth.middleware";

@injectable()
export class ClientWalletController implements IClientWalletController {
  constructor(
    @inject("IGetClientWalletDetailsUseCase")
    private getClientWalletDetailsUseCase: IGetClientWalletDetailsUseCase
  ) {}

  async getWalletDetails(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;
      const { year, month, page = 1, limit = 10 } = req.query;

      if (!clientId) {
        throw new CustomError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
      }

      if (!year || !month) {
        throw new CustomError("Year and month are required", HTTP_STATUS.BAD_REQUEST);
      }

      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        throw new CustomError("Invalid pagination parameters", HTTP_STATUS.BAD_REQUEST);
      }

      const walletDetails = await this.getClientWalletDetailsUseCase.execute(
        clientId,
        Number(year),
        Number(month),
        (pageNumber - 1) * pageSize,
        pageSize
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          wallet: walletDetails.wallet,
          monthlyTransactionCount: walletDetails.monthlyTransactionCount,
          totalTransactionCount: walletDetails.totalTransactionCount,
          totalTransactionAmount: walletDetails.totalTransactionAmount,
          transactions: walletDetails.transactions.items,
          totalPages: Math.ceil(walletDetails.transactions.total / pageSize),
          currentPage: pageNumber,
          totalTransactions: walletDetails.transactions.total,
        },
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }
}