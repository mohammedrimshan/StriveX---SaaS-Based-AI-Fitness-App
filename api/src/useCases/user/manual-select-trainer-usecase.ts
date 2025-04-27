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
    console.log(`Executing ManualSelectTrainerUseCase: clientId=${clientId}, trainerId=${trainerId}`);

    // 1. Get client preferences
    const client = await this._clientRepository.findById(clientId);
    console.log(`Client found: ${JSON.stringify(client)}`);
    if (!client) {
      throw new CustomError(
        ERROR_MESSAGES.PREFERENCES_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // 2. Validate selection mode
    if (client.selectionMode !== "manual") {
      throw new CustomError(
        "Selection mode must be manual for manual selection",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (client.selectedTrainerId && client.selectStatus === TrainerSelectionStatus.ACCEPTED) {
      throw new CustomError(
        "Cannot reassign trainer while current assignment is accepted",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (
      client.selectedTrainerId &&
      client.selectStatus === TrainerSelectionStatus.PENDING &&
      client.selectedTrainerId !== trainerId
    ) {
      throw new CustomError(
        "Cannot Send Request again",
        HTTP_STATUS.BAD_REQUEST
      );
    }


    // 3. Verify the trainer exists and is approved
    const trainer = await this._trainerRepository.findById(trainerId);
    console.log(`Trainer found: ${JSON.stringify(trainer)}`);
    if (!trainer || trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }



    // 4. Update client with selected trainer
    const updatedClient = await this._clientRepository.update(clientId, {
      selectedTrainerId: trainerId,
      selectStatus: TrainerSelectionStatus.PENDING,
    });
    console.log(`Updated client: ${JSON.stringify(updatedClient)}`);

    if (!updatedClient) {
      throw new CustomError(
        "Failed to update preferences",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedClient;
  }
}