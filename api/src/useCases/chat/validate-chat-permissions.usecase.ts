import { inject, injectable } from "tsyringe";
import { IValidateChatPermissionsUseCase } from "@/entities/useCaseInterfaces/chat/validate-chat-permissions-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, ROLES, TrainerSelectionStatus } from "@/shared/constants";

@injectable()
export class ValidateChatPermissionsUseCase implements IValidateChatPermissionsUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(userId: string, role: string, targetId: string): Promise<void> {
    if (role === ROLES.USER) {
      const client = await this._clientRepository.findById(userId);
      if (
        !client ||
        !client.isPremium ||
        client.selectStatus !== TrainerSelectionStatus.ACCEPTED ||
        client.selectedTrainerId !== targetId
      ) {
        throw new CustomError("Invalid chat permissions", HTTP_STATUS.FORBIDDEN);
      }
    } else if (role === ROLES.TRAINER) {
      const client = await this._clientRepository.findById(targetId);
      if (
        !client ||
        !client.isPremium ||
        client.selectStatus !== TrainerSelectionStatus.ACCEPTED ||
        client.selectedTrainerId !== userId
      ) {
        throw new CustomError("Invalid chat permissions", HTTP_STATUS.FORBIDDEN);
      }
    } else {
      throw new CustomError("Invalid user role", HTTP_STATUS.BAD_REQUEST);
    }
  }
}