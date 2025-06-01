import { inject, injectable } from "tsyringe";
import { IUpdateFCMTokenUseCase } from "@/entities/useCaseInterfaces/Notification/update-fcm-token-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class UpdateFCMTokenUseCase implements IUpdateFCMTokenUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}
  async execute(userId: string, fcmToken: string): Promise<void> {
    if (!userId || !fcmToken) {
      throw new CustomError("Missing required fields", HTTP_STATUS.BAD_REQUEST);
    }
    const client = await this._clientRepository.findById(userId);
    if (client) {
      await this._clientRepository.update(userId, { fcmToken });
      return;
    }

    const trainer = await this._trainerRepository.findById(userId);
    if (trainer) {
      await this._trainerRepository.update(userId, { fcmToken });
      return;
    }

    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }
}
