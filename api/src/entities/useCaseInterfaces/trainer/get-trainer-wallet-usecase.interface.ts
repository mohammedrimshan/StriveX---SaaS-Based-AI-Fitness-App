import { IPaymentEntity } from "@/entities/models/payment.entity";

export interface IGetTrainerWalletUseCase {
  execute(
    trainerId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<{ items: IPaymentEntity[]; total: number }>;
}