import { inject, injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, PaymentStatus, TrainerSelectionStatus } from "@/shared/constants";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { IUpgradeSubscriptionUseCase } from "@/entities/useCaseInterfaces/stripe/upgrade-subscription-usecase.interface";

@injectable()
export class UpgradeSubscriptionUseCase implements IUpgradeSubscriptionUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("IMembershipPlanRepository") private membershipPlanRepository: IMembershipPlanRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository,
    @inject("IStripeService") private stripeService: IStripeService
  ) {}

  async execute(data: {
    clientId: string;
    newPlanId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<string> {
    const { clientId, newPlanId, successUrl, cancelUrl } = data;

    const client = await this.clientRepository.findById(clientId);
    if (!client || !client.isPremium || !client.subscriptionEndDate) {
      console.log("Client details:", { client, isPremium: client?.isPremium, subscriptionEndDate: client?.subscriptionEndDate });
      throw new CustomError("No active premium subscription", HTTP_STATUS.BAD_REQUEST);
    }

    const newPlan = await this.membershipPlanRepository.findById(newPlanId);
    if (!newPlan || !newPlan.id) {
      throw new CustomError(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const currentPayment = await this.paymentRepository.findOne({
      clientId,
      status: PaymentStatus.COMPLETED,
    });
    if (!currentPayment) {
      throw new CustomError("No completed payment found", HTTP_STATUS.NOT_FOUND);
    }

    const currentPlan = await this.membershipPlanRepository.findById(currentPayment.membershipPlanId);
    if (!currentPlan) {
      throw new CustomError("Current plan not found", HTTP_STATUS.NOT_FOUND);
    }

    if (currentPlan.id === newPlan.id) {
      throw new CustomError("Cannot upgrade to the same plan", HTTP_STATUS.BAD_REQUEST);
    }

    const now = new Date();
    const remainingDays = Math.ceil(
      (client.subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const prorationCredit = (remainingDays / 30) * currentPlan.price;
    const amountToCharge = Math.max(newPlan.price - prorationCredit, 0);

    // Determine trainerId for the new payment
    let trainerId: string | undefined = undefined;
    if (client.selectedTrainerId && client.selectStatus === TrainerSelectionStatus.ACCEPTED) {
      trainerId = client.selectedTrainerId;
      console.log(`Assigning trainerId ${trainerId} to new payment for client ${clientId}`);
    } else {
      console.log(`No accepted trainer found for client ${clientId}, trainerId will be undefined`);
    }

    const { url, sessionId } = await this.stripeService.createCheckoutSession(
      clientId,
      { id: newPlan.id, price: amountToCharge, name: newPlan.name },
      successUrl,
      cancelUrl
    );

    const payment: Partial<IPaymentEntity> = {
      clientId,
      membershipPlanId: newPlan.id,
      amount: amountToCharge,
      adminAmount: amountToCharge * 0.2,
      trainerAmount: amountToCharge * 0.8,
      trainerId, // Include trainerId if available
      stripeSessionId: sessionId,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
    };

    const savedPayment = await this.paymentRepository.save(payment);
    console.log("New payment saved:", {
      paymentId: savedPayment.id,
      clientId,
      membershipPlanId: newPlan.id,
      trainerId,
      amount: amountToCharge,
      status: PaymentStatus.PENDING,
    });

    return url;
  }
}