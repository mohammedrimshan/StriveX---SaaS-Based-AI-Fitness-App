import { inject, injectable } from "tsyringe";
import { IManualSelectTrainerUseCase } from "@/entities/useCaseInterfaces/users/manual-trainer-select-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  TrainerApprovalStatus,
  TrainerSelectionStatus,
} from "@/shared/constants";

@injectable()
export class ManualSelectTrainerUseCase implements IManualSelectTrainerUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string, trainerId: string): Promise<IClientEntity> {
    const client = await this._clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.PREFERENCES_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (client.selectionMode !== "manual") {
      throw new CustomError(ERROR_MESSAGES.INVALID_SELECTION_MODE, HTTP_STATUS.BAD_REQUEST);
    }

    if (
      client.selectedTrainerId &&
      client.selectStatus === TrainerSelectionStatus.ACCEPTED
    ) {
      throw new CustomError(ERROR_MESSAGES.CANNOT_REASSIGN_TRAINER, HTTP_STATUS.BAD_REQUEST);
    }

    if (
      client.selectedTrainerId &&
      client.selectStatus === TrainerSelectionStatus.PENDING &&
      client.selectedTrainerId !== trainerId
    ) {
      throw new CustomError(ERROR_MESSAGES.CANNOT_SEND_REQUEST_AGAIN, HTTP_STATUS.BAD_REQUEST);
    }

    const trainer = await this._trainerRepository.findById(trainerId);
    if (!trainer || trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updatedClient = await this._clientRepository.update(clientId, {
      selectedTrainerId: trainerId,
      selectStatus: TrainerSelectionStatus.PENDING,
    });

    if (!updatedClient) {
      throw new CustomError(ERROR_MESSAGES.FAILED_TO_UPDATE, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return updatedClient;
  }
}
