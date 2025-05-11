import { inject, injectable } from "tsyringe";
import { ICreateStripeConnectAccountUseCase } from "@/entities/useCaseInterfaces/stripe/create-stripe-connect-account.usecase.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class CreateStripeConnectAccountUseCase implements ICreateStripeConnectAccountUseCase {
  constructor(
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository,
    @inject("IStripeService") private _stripeService: IStripeService
  ) {}

  async execute(
    trainerId: string,
    email: string,
    data: { refreshUrl: string; returnUrl: string }
  ): Promise<{ stripeConnectId: string; accountLinkUrl: string }> {

    const trainer = await this._trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (trainer.role !== "trainer") {
      throw new CustomError(ERROR_MESSAGES.INVALID_TRAINER_ROLE, HTTP_STATUS.BAD_REQUEST);
    }

    if (trainer.stripeConnectId) {
      throw new CustomError(ERROR_MESSAGES.STRIPE_ACCOUNT_EXISTS, HTTP_STATUS.BAD_REQUEST);
    }

    // Create Stripe Connect Account
    const stripeConnectId = await this._stripeService.createConnectAccount(trainerId, email);
    if (!stripeConnectId) {
      throw new CustomError(ERROR_MESSAGES.STRIPE_ACCOUNT_CREATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    await this._trainerRepository.update(trainerId, {
      stripeConnectId,
    });

    const accountLinkUrl = await this._stripeService.createAccountLink(
      stripeConnectId,
      data.refreshUrl,
      data.returnUrl
    );

    return { stripeConnectId, accountLinkUrl };
  }
}
