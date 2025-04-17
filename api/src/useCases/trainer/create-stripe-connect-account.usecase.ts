import { inject, injectable } from "tsyringe";
import { ICreateStripeConnectAccountUseCase } from "@/entities/useCaseInterfaces/stripe/create-stripe-connect-account.usecase.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

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
      throw new CustomError("Trainer not found", HTTP_STATUS.NOT_FOUND);
    }

    if (trainer.role !== "trainer") {
      throw new CustomError("Invalid: Account is not a trainer", HTTP_STATUS.BAD_REQUEST);
    }

    if (trainer.stripeConnectId) {
      throw new CustomError("Stripe Connect account already exists", HTTP_STATUS.BAD_REQUEST);
    }

    const stripeConnectId = await this._stripeService.createConnectAccount(trainerId, email);

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