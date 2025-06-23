import { ITrainerWalletViewEntity } from "@/entities/models/trainer-walletview.entity";

export interface IGetTrainerWalletUseCase {
  execute(
    trainerId: string,
    page?: number,
    limit?: number
  ): Promise<{ items: ITrainerWalletViewEntity[]; total: number }>;
}
