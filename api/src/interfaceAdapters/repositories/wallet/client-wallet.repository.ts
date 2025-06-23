import { injectable } from "tsyringe";
import { IClientWalletEntity } from "@/entities/models/client-wallet.entity";
import { ClientWalletModel } from "@/frameworks/database/mongoDB/models/client-wallet.model";
import { BaseRepository } from "../base.repository";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import { WalletTransactionType } from "@/shared/constants";
import { PipelineStage } from "mongoose";
import { IWalletTransactionEntity } from "@/entities/models/wallet-transaction.entity";
import { WalletTransactionModel } from "@/frameworks/database/mongoDB/models/wallet-transaction.model";
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

  async updateBalance(
    clientId: string,
    amount: number
  ): Promise<IClientWalletEntity | null> {
    const wallet = await this.findByClientId(clientId);
    console.log(wallet, "wallet from repo");

    // Calculate new balance: if wallet doesn't exist, start from 0
    const newBalance = (wallet?.balance || 0) + amount;
    console.log(newBalance, "newBalance");

    // Update wallet balance or create new wallet if none exists
    return this.findOneAndUpdateAndMap(
      { clientId }, // filter
      { balance: newBalance }, // update
      { upsert: true, new: true } // options: create if not found, return updated doc
    );
  }

  async getWalletTransactionSummary(
    clientId: string,
    year: number,
    month: number,
    skip: number,
    limit: number,
    type?: WalletTransactionType
  ): Promise<{
    monthlyTransactionCount: number;
    totalTransactionCount: number;
    totalTransactionAmount: number;
    transactions: IWalletTransactionEntity[];
    transactionTotal: number;
  }> {
    if (!clientId || typeof clientId !== "string") {
      throw new Error("Invalid clientId");
    }
    if (month < 1 || month > 12) {
      throw new Error("Invalid month");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // ✅ Apply correct filtering by clientId and date range
    const matchStage: any = {
      clientId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (type) {
      matchStage.type = type;
    }

    const transactionPipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $facet: {
          monthlyCount: [
            { $count: "count" }, // Already filtered by month from matchStage
          ],
          totalCount: [
            { $count: "count" }, // Total count for the month
          ],
          totalAmount: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", WalletTransactionType.WITHDRAWAL] },
                      { $multiply: ["$amount", -1] },
                      "$amount",
                    ],
                  },
                },
              },
            },
          ],
          transactions: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                id: "$_id",
                clientId: 1,
                amount: { $round: ["$amount", 2] },
                type: 1,
                reason: 1,
                createdAt: 1,
              },
            },
          ],
          transactionTotal: [{ $count: "count" }],
        },
      },
      {
        $project: {
          monthlyTransactionCount: {
            $ifNull: [{ $arrayElemAt: ["$monthlyCount.count", 0] }, 0],
          },
          totalTransactionCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
          totalTransactionAmount: {
            $cond: {
              if: { $lt: [{ $arrayElemAt: ["$totalAmount.total", 0] }, 0] },
              then: 0,
              else: {
                $round: [{ $arrayElemAt: ["$totalAmount.total", 0] }, 2],
              },
            },
          },

          transactions: "$transactions",
          transactionTotal: {
            $ifNull: [{ $arrayElemAt: ["$transactionTotal.count", 0] }, 0],
          },
        },
      },
    ];

    const transactionResult = await WalletTransactionModel.aggregate(
      transactionPipeline
    ).exec();

    const {
      monthlyTransactionCount = 0,
      totalTransactionCount = 0,
      totalTransactionAmount = 0,
      transactions = [],
      transactionTotal = 0,
    } = transactionResult[0] || {};

    return {
      monthlyTransactionCount,
      totalTransactionCount,
      totalTransactionAmount,
      transactions: transactions.map((item: any) => ({
        ...item,
        id: item._id?.toString?.() || item.id,
      })),
      transactionTotal,
    };
  }
}
