import { inject, injectable } from "tsyringe";
import { ICreateCheckoutSessionUseCase } from "@/entities/useCaseInterfaces/stripe/create-checkout-session.usecase.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import { IWalletTransactionRepository } from "@/entities/repositoryInterfaces/wallet/wallet-transaction.repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  PaymentStatus,
  WalletTransactionType,
} from "@/shared/constants";
import { IPaymentEntity } from "@/entities/models/payment.entity";

@injectable()
export class CreateCheckoutSessionUseCase
  implements ICreateCheckoutSessionUseCase
{
  private _stripeService: IStripeService;
  private _membershipPlanRepository: IMembershipPlanRepository;
  private _paymentRepository: IPaymentRepository;
  private _clientWalletRepository: IClientWalletRepository;
  private _walletTransactionRepository: IWalletTransactionRepository;
  constructor(
    @inject("IStripeService") stripeService: IStripeService,
    @inject("IMembershipPlanRepository")
    membershipPlanRepository: IMembershipPlanRepository,
    @inject("IPaymentRepository") paymentRepository: IPaymentRepository,
    @inject("IClientWalletRepository")
    clientWalletRepository: IClientWalletRepository,
    @inject("IWalletTransactionRepository")
    walletTransactionRepository: IWalletTransactionRepository
  ) {
    this._stripeService = stripeService;
    this._membershipPlanRepository = membershipPlanRepository;
    this._paymentRepository = paymentRepository;
    this._clientWalletRepository = clientWalletRepository;
    this._walletTransactionRepository = walletTransactionRepository;
  }

  async execute(data: {
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<string> {
    const { userId: clientId, planId, successUrl, cancelUrl } = data;

    if (!clientId) {
      throw new CustomError(
        ERROR_MESSAGES.ID_REQUIRED,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const plan = await this._membershipPlanRepository.findById(planId);
    if (!plan || !plan.id) {
      throw new CustomError(
        ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const wallet = await this._clientWalletRepository.findByClientId(clientId);
    const walletBalance = wallet?.balance || 0;
    const amountToCharge = Math.max(plan.price - walletBalance, 0);

    const { url, sessionId } = await this._stripeService.createCheckoutSession(
      clientId,
      { id: plan.id, price: amountToCharge, name: plan.name },
      successUrl,
      cancelUrl
    );

    const payment: Partial<IPaymentEntity> = {
      clientId,
      membershipPlanId: plan.id,
      amount: plan.price,
      adminAmount: plan.price * 0.2,
      trainerAmount: plan.price * 0.8,
      stripeSessionId: sessionId,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      remainingBalance: plan.price
    };

    await this._paymentRepository.save(payment);

    if (walletBalance > 0) {
      await this._clientWalletRepository.updateBalance(
        clientId,
        -walletBalance
      );
      await this._walletTransactionRepository.save({
        clientId,
        amount: walletBalance,
        type: WalletTransactionType.WITHDRAWAL,
        reason: "PLAN_SUBSCRIPTION",
        createdAt: new Date(),
      });
    }

    return url;
  }
}
