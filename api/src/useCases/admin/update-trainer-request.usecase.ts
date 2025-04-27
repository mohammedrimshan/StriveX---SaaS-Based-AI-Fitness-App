import { inject, injectable } from "tsyringe";
import { IUpdateTrainerRequestUseCase } from "@/entities/useCaseInterfaces/admin/update-user-trainer-request-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, TrainerSelectionStatus, TrainerApprovalStatus } from "@/shared/constants";

@injectable()
export class UpdateTrainerRequestUseCase implements IUpdateTrainerRequestUseCase {
  constructor(
    @inject("IClientRepository")
    private _clientRepository: IClientRepository,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string, trainerId: string): Promise<IClientEntity> {
    const preferences = await this._clientRepository.findByClientId(clientId);
    if (!preferences) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const trainer = await this._trainerRepository.findById(trainerId);
    if (!trainer || trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(ERROR_MESSAGES.TRAINER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updatedPreferences = await this._clientRepository.updateByClientId(clientId, {
      selectedTrainerId: trainerId,
      status: TrainerSelectionStatus.ASSIGNED,
    });

    if (!updatedPreferences) {
      throw new CustomError("Failed to update trainer request", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return updatedPreferences;
  }
}