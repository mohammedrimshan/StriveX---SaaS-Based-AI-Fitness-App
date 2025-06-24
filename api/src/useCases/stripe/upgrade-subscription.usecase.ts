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
import { ERROR_MESSAGES, HTTP_STATUS, PaymentStatus, TrainerSelectionStatus, WalletTransactionType } from "@/shared/constants";
import { IPaymentEntity } from "@/entities/models/payment.entity";

@injectable()
export class UpgradeSubscriptionUseCase implements IUpgradeSubscriptionUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("IMembershipPlanRepository") private membershipPlanRepository: IMembershipPlanRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository,
    @inject("IStripeService") private stripeService: IStripeService,
    @inject("IClientWalletRepository") private clientWalletRepository: IClientWalletRepository,
    @inject("IWalletTransactionRepository") private walletTransactionRepository: IWalletTransactionRepository
  ) {}

  async execute(data: {
    clientId: string;
    newPlanId: string;
    successUrl: string;
    cancelUrl: string;
    useWalletBalance?: boolean;
  }): Promise<string> {
    const { clientId, newPlanId, successUrl, cancelUrl, useWalletBalance = false } = data;
    console.log(`[${new Date().toISOString()}] [UpgradeSubscriptionUseCase] Start: clientId=${clientId}, newPlanId=${newPlanId}, useWalletBalance=${useWalletBalance}`);

    try {
      // Check for existing pending payment
      console.log(`[${new Date().toISOString()}] Checking for existing pending payment for clientId: ${clientId}, newPlanId: ${newPlanId}`);
      const existingPayment = await this.paymentRepository.findOne({
        clientId,
        membershipPlanId: newPlanId,
        status: PaymentStatus.PENDING,
      });
      if (existingPayment && existingPayment.stripeSessionId) {
        console.log(`[${new Date().toISOString()}] Reusing existing pending payment: ${existingPayment.id}`);
        const stripeSession = await this.stripeService.getCheckoutSessionByUrl(existingPayment.stripeSessionId);
        if (stripeSession.url) {
          return stripeSession.url;
        }
      }

      // Validate client
      console.log(`[${new Date().toISOString()}] Validating client: ${clientId}`);
      const client = await this.clientRepository.findById(clientId);
      if (!client || !client.isPremium || !client.subscriptionEndDate) {
        console.error(`[${new Date().toISOString()}] No active premium subscription for clientId: ${clientId}`);
        throw new CustomError("No active premium subscription", HTTP_STATUS.BAD_REQUEST);
      }

      // Validate new plan
      console.log(`[${new Date().toISOString()}] Validating plan: ${newPlanId}`);
      const newPlan = await this.membershipPlanRepository.findById(newPlanId);
      if (!newPlan) {
        console.error(`[${new Date().toISOString()}] Membership plan not found: ${newPlanId}`);
        throw new CustomError(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
      }

      // Validate current payment
      console.log(`[${new Date().toISOString()}] Finding current payment for clientId: ${clientId}`);
      const currentPayment = await this.paymentRepository.findOne({
        clientId,
        status: PaymentStatus.COMPLETED,
      });
      if (!currentPayment) {
        console.error(`[${new Date().toISOString()}] No completed payment found for clientId: ${clientId}`);
        throw new CustomError("No completed payment found", HTTP_STATUS.NOT_FOUND);
      }

      // Validate current plan
      console.log(`[${new Date().toISOString()}] Validating plan: ${currentPayment.membershipPlanId}`);
      const currentPlan = await this.membershipPlanRepository.findById(currentPayment.membershipPlanId);
      if (!currentPlan) {
        console.error(`[${new Date().toISOString()}] Current plan not found: ${currentPayment.membershipPlanId}`);
        throw new CustomError("Current plan not found", HTTP_STATUS.BAD_REQUEST);
      }

      if (currentPlan.id === newPlan.id) {
        console.error(`[${new Date().toISOString()}] Attempted to upgrade to the same plan: ${newPlan.id}`);
        throw new CustomError("Cannot upgrade to the same plan", HTTP_STATUS.BAD_REQUEST);
      }

      // Calculate proration credit
      console.log(`[${new Date().toISOString()}] Calculating proration credit`);
      const now = new Date();
      const remainingDays = Math.ceil(
        (client.subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const prorationCredit = (remainingDays / 30) * currentPlan.price;
      console.log(`[${new Date().toISOString()}] Proration credit: ${prorationCredit}, remainingDays: ${remainingDays}`);

      // Step 1: Subtract proration credit from new plan price
      let amountToCharge = newPlan.price - prorationCredit;
      amountToCharge = Math.max(amountToCharge, 0);

      // Step 2: Apply wallet balance
      let walletBalance = 0;
      let walletUsedAmount = 0;
      if (useWalletBalance) {
        console.log(`[${new Date().toISOString()}] Checking wallet balance for clientId: ${clientId}`);
        const wallet = await this.clientWalletRepository.findByClientId(clientId);
        if (!wallet) {
          console.error(`[${new Date().toISOString()}] No wallet found for clientId: ${clientId}`);
          throw new CustomError("No wallet found", HTTP_STATUS.BAD_REQUEST);
        }
        walletBalance = wallet.balance || 0;
        console.log(`[${new Date().toISOString()}] Wallet balance for clientId ${clientId}: ${walletBalance}`);

        if (walletBalance > 0) {
          walletUsedAmount = Math.min(walletBalance, amountToCharge);
          amountToCharge -= walletUsedAmount;
          amountToCharge = Math.max(amountToCharge, 0);
        } else {
          console.log(`[${new Date().toISOString()}] Insufficient wallet balance for clientId: ${clientId}`);
        }
      }

      console.log(
        `[${new Date().toISOString()}] Amount to charge after proration and wallet applied: ${amountToCharge}, walletUsedAmount: ${walletUsedAmount}`
      );

      // Determine trainerId
      let trainerId: string | undefined;
      if (client.selectedTrainerId && client.selectStatus === TrainerSelectionStatus.ACCEPTED) {
        trainerId = client.selectedTrainerId;
        console.log(`[${new Date().toISOString()}] Trainer ID assigned: ${trainerId}`);
      }

      // Deduct wallet balance if used
      if (walletUsedAmount > 0) {
        console.log(`[${new Date().toISOString()}] Deducting wallet balance: ${walletUsedAmount}`);
        const walletBefore = await this.clientWalletRepository.findByClientId(clientId);
        if (!walletBefore) {
          console.error(`[${new Date().toISOString()}] No wallet found for clientId: ${clientId} during wallet deduction`);
          throw new CustomError("No wallet found", HTTP_STATUS.BAD_REQUEST);
        }
        console.log(`[${new Date().toISOString()}] Wallet balance before deduction: ${walletBefore.balance}`);

        const updatedWallet = await this.clientWalletRepository.updateBalance(clientId, -walletUsedAmount);
        if (!updatedWallet || updatedWallet.balance < 0) {
          console.error(
            `[${new Date().toISOString()}] Failed to update wallet balance for clientId: ${clientId}, new balance: ${
              updatedWallet?.balance
            }`
          );
          throw new CustomError("Failed to update wallet balance or insufficient balance", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        console.log(`[${new Date().toISOString()}] Wallet balance updated, new balance: ${updatedWallet.balance}`);

        await this.walletTransactionRepository.save({
          clientId,
          amount: walletUsedAmount,
          type: WalletTransactionType.WITHDRAWAL,
          reason: `SUBSCRIPTION_${newPlan.id}_WALLET`,
          createdAt: new Date(),
        });
        console.log(`[${new Date().toISOString()}] Wallet transaction recorded for clientId: ${clientId}, amount: ${walletUsedAmount}`);
      }

      if (amountToCharge <= 0) {
        // Wallet fully covers amount, no Stripe payment needed
        console.log(`[${new Date().toISOString()}] No Stripe payment needed, processing wallet-only payment`);

        try {
          // Save payment record
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
          console.log(`[${new Date().toISOString()}] Payment saved: ${payment.id}`);

          // Update client subscription
          console.log(`[${new Date().toISOString()}] Updating client subscription for clientId: ${clientId}`);
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
            console.error(`[${new Date().toISOString()}] Failed to update client subscription for clientId: ${clientId}`);
            // Rollback payment and wallet changes
            if (walletUsedAmount > 0) {
              await this.clientWalletRepository.updateBalance(clientId, walletUsedAmount); // Restore wallet balance
              await this.walletTransactionRepository.deleteByReason(`SUBSCRIPTION_${newPlan.id}_WALLET`);
            }
            await this.paymentRepository.deleteById(payment.id!);
            throw new CustomError("Failed to update client subscription", HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }
          console.log(`[${new Date().toISOString()}] Client subscription updated for clientId: ${clientId}`);

          return `${successUrl}?source=wallet`; // Return wallet-specific success URL
        } catch (error: unknown) {
          console.error(
            `[${new Date().toISOString()}] Error processing wallet-only payment for clientId: ${clientId}, error: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          // Rollback wallet changes if payment or client update fails
          if (walletUsedAmount > 0) {
            await this.clientWalletRepository.updateBalance(clientId, walletUsedAmount); // Restore wallet balance
            await this.walletTransactionRepository.deleteByReason(`SUBSCRIPTION_${newPlan.id}_WALLET`);
          }
          throw error instanceof Error ? error : new CustomError(String(error), HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
      }

      // Create Stripe checkout session for remaining amount
      console.log(`[${new Date().toISOString()}] Creating Stripe checkout session for amount: ${amountToCharge}`);
      const session = await this.stripeService.createCheckoutSession(
        clientId,
        { id: newPlan.id, price: amountToCharge, name: newPlan.name },
        successUrl,
        cancelUrl,
        { clientId, planId: newPlan.id, walletAppliedAmount: walletUsedAmount.toString() }
      );

      // Save pending payment record
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
        console.log(`[${new Date().toISOString()}] Pending payment saved: ${payment.id}, stripeSessionId: ${session.sessionId}`);
      } catch (error: unknown) {
        console.error(
          `[${new Date().toISOString()}] Error saving pending payment for clientId: ${clientId}, error: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        // Rollback wallet changes if payment save fails
        if (walletUsedAmount > 0) {
          await this.clientWalletRepository.updateBalance(clientId, walletUsedAmount); // Restore wallet balance
          await this.walletTransactionRepository.deleteByReason(`SUBSCRIPTION_${newPlan.id}_WALLET`);
        }
        throw error instanceof Error ? error : new CustomError(String(error), HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      return session.url!;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${new Date().toISOString()}] Error in UpgradeSubscriptionUseCase for clientId: ${clientId}, error: ${errorMessage}`);
      throw error;
    }
  }
}