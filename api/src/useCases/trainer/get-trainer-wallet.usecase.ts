import { injectable, inject } from "tsyringe";
import { IGetTrainerWalletUseCase } from "@/entities/useCaseInterfaces/trainer/get-trainer-wallet-usecase.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { ITrainerWalletViewEntity } from "@/entities/models/trainer-walletview.entity";

@injectable()
export class GetTrainerWalletUseCase implements IGetTrainerWalletUseCase {
  constructor(
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository
  ) {}

  async execute(
  trainerId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ items: ITrainerWalletViewEntity[]; total: number }> {
  if (!trainerId) {
    throw new CustomError("Trainer ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  const skip = (page - 1) * limit;

  try {
    const result = await this.paymentRepository.findTrainerPaymentHistory(
      trainerId,
      skip,
      limit
    );
    return result;
  } catch (error) {
    throw new CustomError(
      "Failed to retrieve payment history",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
}