import { inject, injectable } from "tsyringe";
import { ICreateCheckoutSessionUseCase } from "@/entities/useCaseInterfaces/stripe/create-checkout-session.usecase.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, PaymentStatus } from "@/shared/constants";
import { IPaymentEntity } from "@/entities/models/payment.entity";

@injectable()
export class CreateCheckoutSessionUseCase implements ICreateCheckoutSessionUseCase {
  private _stripeService: IStripeService;
  private _membershipPlanRepository: IMembershipPlanRepository;
  private _paymentRepository: IPaymentRepository;

  constructor(
    @inject("IStripeService") stripeService: IStripeService,
    @inject("IMembershipPlanRepository") membershipPlanRepository: IMembershipPlanRepository,
    @inject("IPaymentRepository") paymentRepository: IPaymentRepository
  ) {
    this._stripeService = stripeService;
    this._membershipPlanRepository = membershipPlanRepository;
    this._paymentRepository = paymentRepository;
  }

  async execute(data: {
    userId: string; // This is actually clientId
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<string> {
    const { userId: clientId, planId, successUrl, cancelUrl } = data;

    if (!clientId) {
      throw new CustomError("Client ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    // Fetch the membership plan
    const plan = await this._membershipPlanRepository.findById(planId);
    if (!plan || !plan.id) {
      throw new CustomError("Membership plan not found", HTTP_STATUS.NOT_FOUND);
    }

    // Create the Stripe checkout session
    const { url, sessionId } = await this._stripeService.createCheckoutSession(
      clientId,
      { id: plan.id, price: plan.price, name: plan.name },
      successUrl,
      cancelUrl
    );

    // Create the payment record with the sessionId
    const payment: Partial<IPaymentEntity> = {
      clientId,
      membershipPlanId: plan.id,
      amount: plan.price,
      adminAmount: plan.price * 0.2,
      trainerAmount: plan.price * 0.8,
      stripeSessionId: sessionId,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
    };

    await this._paymentRepository.save(payment);

    return url;
  }
}