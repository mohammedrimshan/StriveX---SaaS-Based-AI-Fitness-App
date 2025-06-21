import { injectable, inject } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import { IWalletTransactionRepository } from "@/entities/repositoryInterfaces/wallet/wallet-transaction.repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { CronJob } from "cron";
import { PaymentStatus, WalletTransactionType } from "@/shared/constants";
import mongoose from "mongoose";

@injectable()
export class DailyUnusedSessionProcessor {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("IMembershipPlanRepository") private membershipPlanRepository: IMembershipPlanRepository,
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("IClientWalletRepository") private clientWalletRepository: IClientWalletRepository,
    @inject("IWalletTransactionRepository") private walletTransactionRepository: IWalletTransactionRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository,
    @inject("NotificationService") private notificationService: NotificationService
  ) {}

  start() {
    const job = new CronJob("0 0 * * *", async () => {
      try {
        console.log("Checking for unused sessions...");
        const today = new Date().toISOString().split("T")[0];
        const { items: clients } = await this.clientRepository.find(
          { isPremium: true, subscriptionEndDate: { $gte: new Date() } },
          0,
          1000
        );

        for (const client of clients) {
          if (client && client.id) {
            const clientId = client.id.toString();
            const bookedSlots = await this.slotRepository.findBookedSlotsByClientId(clientId);
            const hasBookedToday = bookedSlots.some((slot) => slot.date === today);

            if (!hasBookedToday) {
              const plan = await this.membershipPlanRepository.findById(client.membershipPlanId!);
              if (!plan) {
                console.error(`Plan not found for client ${clientId}`);
                continue;
              }

              const planDurationInDays = plan.durationMonths * 30;
              const perSessionRate = plan.price / planDurationInDays;

              const session = await mongoose.startSession();
              session.startTransaction();
              try {
                await this.clientWalletRepository.updateBalance(clientId, perSessionRate, session);
                await this.walletTransactionRepository.save(
                  {
                    clientId,
                    amount: perSessionRate,
                    type: WalletTransactionType.REFUND,
                    reason: "UNBOOKED_DAY",
                    createdAt: new Date(),
                  },
                  session
                );

                const payment = await this.paymentRepository.findOne(
                  {
                    clientId,
                    membershipPlanId: client.membershipPlanId,
                    status: PaymentStatus.COMPLETED,
                  },
                  { createdAt: -1 }
                );

                if (payment && payment.id) {
                  const newRemainingBalance = (payment.remainingBalance || plan.price) - perSessionRate;
                  await this.paymentRepository.updateById(payment.id, {
                    remainingBalance: Math.max(newRemainingBalance, 0),
                    updatedAt: new Date(),
                  });
                  console.log(`Updated remainingBalance to ${newRemainingBalance} for payment ${payment.id}`);
                }

                await session.commitTransaction();

                // ✅ Send notification
                await this.notificationService.sendToUser(
                  clientId,
                  "Session Refund",
                  `₹${perSessionRate.toFixed(2)} has been refunded to your wallet for not booking a session today (${today}).`,
                  "INFO"
                );

              } catch (error) {
                await session.abortTransaction();
                console.error(`Failed to refund for client ${clientId}:`, error);
                continue;
              } finally {
                session.endSession();
              }

              console.log(`Refunded ₹${perSessionRate} to wallet for client ${clientId} for unbooked day ${today}`);
            }
          }
        }
      } catch (error) {
        console.error("Error in daily unused session check:", error);
      }
    });

    job.start();
  }
}
