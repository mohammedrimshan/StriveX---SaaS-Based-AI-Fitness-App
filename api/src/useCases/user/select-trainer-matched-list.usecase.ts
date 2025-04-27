import { inject, injectable } from "tsyringe";
import { ISelectTrainerFromMatchedListUseCase } from "@/entities/useCaseInterfaces/users/select-trainer-matched-list.usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  TrainerApprovalStatus,
  TrainerSelectionStatus,
} from "@/shared/constants";

@injectable()
export class SelectTrainerFromMatchedListUseCase
  implements ISelectTrainerFromMatchedListUseCase
{
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string, selectedTrainerId: string): Promise<{
    selectedTrainerId: string;
    selectStatus: TrainerSelectionStatus;
  }> {
    // Step 1: Get client preferences
    const client = await this._clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Step 2: Validate if the selected trainer is in the matched list
    if (!client.matchedTrainers || !client.matchedTrainers.includes(selectedTrainerId)) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_NOT_IN_MATCHED_LIST,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Step 3: Verify the trainer exists and is approved
    const trainer = await this._trainerRepository.findById(selectedTrainerId);
    if (!trainer || trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_NOT_APPROVED,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Step 4: Update client with the selected trainer and set the status to pending
    const updatedClient = await this._clientRepository.update(clientId, {
      selectedTrainerId: selectedTrainerId,
      selectStatus: TrainerSelectionStatus.PENDING, 
    });

    if (!updatedClient) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
    return {
      selectedTrainerId: selectedTrainerId,
      selectStatus: TrainerSelectionStatus.PENDING,
    };
  }
}
