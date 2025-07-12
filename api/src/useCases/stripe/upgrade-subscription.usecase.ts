import { inject, injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import { IWalletTransactionRepository } from "@/entities/repositoryInterfaces/wallet/wallet-transaction.repository.interface";
import { IUpgradeSubscriptionUseCase } from "@/entities/useCaseInterfaces/stripe/upgrade-subscription-usecase.interface";
import mongoose from "mongoose";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  PaymentStatus,
  TrainerSelectionStatus,
  WalletTransactionType,
} from "@/shared/constants";
import { IPaymentEntity } from "@/entities/models/payment.entity";

@injectable()
export class UpgradeSubscriptionUseCase implements IUpgradeSubscriptionUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("IMembershipPlanRepository")
    private membershipPlanRepository: IMembershipPlanRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository,
    @inject("IStripeService") private stripeService: IStripeService,
    @inject("IClientWalletRepository")
    private clientWalletRepository: IClientWalletRepository,
    @inject("IWalletTransactionRepository")
    private walletTransactionRepository: IWalletTransactionRepository
  ) {}

  async execute(data: {
    clientId: string;
    newPlanId: string;
    successUrl: string;
    cancelUrl: string;
    useWalletBalance?: boolean;
  }): Promise<string> {
    const {
      clientId,
      newPlanId,
      successUrl,
      cancelUrl,
      useWalletBalance = false,
    } = data;

    try {
      const existingPayment = await this.paymentRepository.findOne({
        clientId,
        membershipPlanId: newPlanId,
        status: PaymentStatus.PENDING,
      });
      if (existingPayment && existingPayment.stripeSessionId) {
        const stripeSession = await this.stripeService.getCheckoutSessionByUrl(
          existingPayment.stripeSessionId
        );
        if (stripeSession.url) {
          return stripeSession.url;
        }
      }

      const client = await this.clientRepository.findById(clientId);
      if (!client || !client.isPremium || !client.subscriptionEndDate) {
        throw new CustomError(
          "No active premium subscription",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const newPlan = await this.membershipPlanRepository.findById(newPlanId);
      if (!newPlan) {
        throw new CustomError(
          ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const currentPayment = await this.paymentRepository.findOne({
        clientId,
        status: PaymentStatus.COMPLETED,
      });
      if (!currentPayment) {
        throw new CustomError(
          "No completed payment found",
          HTTP_STATUS.NOT_FOUND
        );
      }

      const currentPlan = await this.membershipPlanRepository.findById(
        currentPayment.membershipPlanId
      );
      if (!currentPlan) {
        throw new CustomError(
          "Current plan not found",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (currentPlan.id === newPlan.id) {
        throw new CustomError(
          "Cannot upgrade to the same plan",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const now = new Date();
      const remainingDays = Math.ceil(
        (client.subscriptionEndDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const prorationCredit = (remainingDays / 30) * currentPlan.price;

      let amountToCharge = newPlan.price - prorationCredit;
      amountToCharge = Math.max(amountToCharge, 0);

      let walletBalance = 0;
      let walletUsedAmount = 0;
      if (useWalletBalance) {
        const wallet = await this.clientWalletRepository.findByClientId(
          clientId
        );
        if (!wallet) {
          throw new CustomError("No wallet found", HTTP_STATUS.BAD_REQUEST);
        }
        walletBalance = wallet.balance || 0;

        if (walletBalance > 0) {
          walletUsedAmount = Math.min(walletBalance, amountToCharge);
          amountToCharge -= walletUsedAmount;
          amountToCharge = Math.max(amountToCharge, 0);
        }
      }

      let trainerId: string | undefined;
      if (
        client.selectedTrainerId &&
        client.selectStatus === TrainerSelectionStatus.ACCEPTED
      ) {
        trainerId = client.selectedTrainerId;
      }

      if (walletUsedAmount > 0) {
        const walletBefore = await this.clientWalletRepository.findByClientId(
          clientId
        );
        if (!walletBefore) {
          throw new CustomError("No wallet found", HTTP_STATUS.BAD_REQUEST);
        }

        const updatedWallet = await this.clientWalletRepository.updateBalance(
          clientId,
          -walletUsedAmount
        );
        if (!updatedWallet || updatedWallet.balance < 0) {
          throw new CustomError(
            "Failed to update wallet balance or insufficient balance",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
          );
        }

        await this.walletTransactionRepository.save({
          clientId,
          amount: walletUsedAmount,
          type: WalletTransactionType.WITHDRAWAL,
          reason: `SUBSCRIPTION_${newPlan.id}_WALLET`,
          createdAt: new Date(),
        });
      }

      if (amountToCharge <= 0) {
        try {
          const payment: Partial<IPaymentEntity> = {
            id: new mongoose.Types.ObjectId().toString(),
            clientId,
            membershipPlanId: newPlan.id,
            amount: newPlan.price,
            adminAmount: newPlan.price * 0.2,
            trainerAmount: newPlan.price * 0.8,
            trainerId,
            status: PaymentStatus.COMPLETED,
            createdAt: new Date(),
            updatedAt: new Date(),
            remainingBalance: 0,
            walletAppliedAmount: walletUsedAmount,
            paymentSource: "WALLET",
            stripeSessionId: undefined,
            stripePaymentId: undefined,
          };
          await this.paymentRepository.save(payment);

          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + newPlan.durationMonths);
          const updated = await this.clientRepository.update(clientId, {
            isPremium: true,
            membershipPlanId: newPlan.id,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
          });
          if (!updated) {
            if (walletUsedAmount > 0) {
              await this.clientWalletRepository.updateBalance(
                clientId,
                walletUsedAmount
              );
              await this.walletTransactionRepository.deleteByReason(
                `SUBSCRIPTION_${newPlan.id}_WALLET`
              );
            }
            await this.paymentRepository.deleteById(payment.id!);
            throw new CustomError(
              "Failed to update client subscription",
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
          }

          return `${successUrl}?source=wallet`;
        } catch (error: unknown) {
          if (walletUsedAmount > 0) {
            await this.clientWalletRepository.updateBalance(
              clientId,
              walletUsedAmount
            );
            await this.walletTransactionRepository.deleteByReason(
              `SUBSCRIPTION_${newPlan.id}_WALLET`
            );
          }
          throw error instanceof Error
            ? error
            : new CustomError(String(error), HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
      }

      const session = await this.stripeService.createCheckoutSession(
        clientId,
        { id: newPlan.id, price: amountToCharge, name: newPlan.name },
        successUrl,
        cancelUrl,
        {
          clientId,
          planId: newPlan.id,
          walletAppliedAmount: walletUsedAmount.toString(),
        }
      );

      const payment: Partial<IPaymentEntity> = {
        id: new mongoose.Types.ObjectId().toString(),
        clientId,
        membershipPlanId: newPlan.id,
        amount: newPlan.price,
        adminAmount: newPlan.price * 0.2,
        trainerAmount: newPlan.price * 0.8,
        trainerId,
        stripeSessionId: session.sessionId,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        remainingBalance: amountToCharge,
        walletAppliedAmount: walletUsedAmount,
        paymentSource: walletUsedAmount > 0 ? "MIXED" : "STRIPE",
      };

      try {
        await this.paymentRepository.save(payment);
      } catch (error: unknown) {
        if (walletUsedAmount > 0) {
          await this.clientWalletRepository.updateBalance(
            clientId,
            walletUsedAmount
          );
          await this.walletTransactionRepository.deleteByReason(
            `SUBSCRIPTION_${newPlan.id}_WALLET`
          );
        }
        throw error instanceof Error
          ? error
          : new CustomError(String(error), HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      return session.url!;
    } catch (error: unknown) {
      throw error;
    }
  }
}
