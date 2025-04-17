import { inject, injectable } from "tsyringe";
import { ICreateCheckoutSessionUseCase } from "@/entities/useCaseInterfaces/stripe/create-checkout-session.usecase.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class CreateCheckoutSessionUseCase implements ICreateCheckoutSessionUseCase {
  constructor(
    @inject("IStripeService") private _stripeService: IStripeService,
    @inject("IMembershipPlanRepository") private _membershipPlanRepository: IMembershipPlanRepository
  ) {}

  async execute(data: {
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<string> {
    const { userId, planId, successUrl, cancelUrl } = data;

    const plan = await this._membershipPlanRepository.findById(planId);
    if (!plan || !plan.id) {
      throw new CustomError("Membership plan not found", HTTP_STATUS.NOT_FOUND);
    }

    const url = await this._stripeService.createCheckoutSession(
      userId,
      { id: plan.id, price: plan.price, name: plan.name },
      successUrl,
      cancelUrl
    );

    return url;
  }
}