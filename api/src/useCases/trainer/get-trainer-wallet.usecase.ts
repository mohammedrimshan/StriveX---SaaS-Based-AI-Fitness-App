import { injectable, inject } from "tsyringe";
import { IGetTrainerWalletUseCase } from "@/entities/useCaseInterfaces/trainer/get-trainer-wallet-usecase.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetTrainerWalletUseCase implements IGetTrainerWalletUseCase {
  constructor(
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository
  ) {}

  async execute(
    trainerId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ items: IPaymentEntity[]; total: number }> {
    if (!trainerId) {
      throw new CustomError("Trainer ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const skip = (page - 1) * limit;

    try {
      const result = await this.paymentRepository.findTrainerPaymentHistory(
        trainerId,
        skip,
        limit,
        status
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