import { injectable, inject } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import { IWalletTransactionRepository } from "@/entities/repositoryInterfaces/wallet/wallet-transaction.repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { CronJob } from "cron";
import { WalletTransactionType, PaymentStatus, TrainerSelectionStatus } from "@/shared/constants";
import mongoose from "mongoose";

@injectable()
export class SubscriptionExpiryProcessor {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("IClientWalletRepository") private clientWalletRepository: IClientWalletRepository,
    @inject("IWalletTransactionRepository") private walletTransactionRepository: IWalletTransactionRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository
  ) {}

  async start() {
    const job = new CronJob("0 0 * * *", async () => {
      try {
        console.log("Checking for expired subscriptions...");
        const { items: clients } = await this.clientRepository.find(
          { isPremium: true, subscriptionEndDate: { $lte: new Date() } },
          0,
          1000
        );

        for (const client of clients) {
          if (client && client.id) {
            const clientId = client.id.toString();
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
              const payment = await this.paymentRepository.findOne(
                {
                  clientId,
                  membershipPlanId: client.membershipPlanId,
                  status: PaymentStatus.COMPLETED,
                },
                { createdAt: -1 }
              );

              if (!payment) {
                console.error(`Payment not found for client ${clientId}`);
                continue;
              }

              const refundAmount = payment.remainingBalance || 0;

              if (refundAmount > 0) {
                await this.clientWalletRepository.updateBalance(clientId, refundAmount, session);
                await this.walletTransactionRepository.save(
                  {
                    clientId,
                    amount: refundAmount,
                    type: WalletTransactionType.REFUND,
                    reason: "SUBSCRIPTION_EXPIRY",
                    createdAt: new Date(),
                  },
                  session
                );
                console.log(`Refunded ${refundAmount} to wallet for client ${clientId}`);

                await this.paymentRepository.updateById(payment.id, {
                  remainingBalance: 0,
                  updatedAt: new Date(),
                });
              }

              await this.clientRepository.updateByClientId(
                clientId,
                {
                  isPremium: false,
                  subscriptionStartDate: undefined,
                  subscriptionEndDate: undefined,
                  selectedTrainerId: undefined,
                  selectStatus: TrainerSelectionStatus.PENDING,
                  matchedTrainers: [],
                },
                session
              );
              console.log(`Subscription expired for client: ${clientId}`);

              await session.commitTransaction();
            } catch (error) {
              await session.abortTransaction();
              console.error(`Failed to process expiry for client ${clientId}:`, error);
              continue;
            } finally {
              session.endSession();
            }
          }
        }
      } catch (error) {
        console.error("Error in subscription expiry check:", error);
      }
    });

    job.start();
  }
}
