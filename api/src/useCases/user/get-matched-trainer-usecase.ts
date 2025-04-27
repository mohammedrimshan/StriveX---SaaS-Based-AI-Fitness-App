
import { inject, injectable } from "tsyringe";
import { IGetMatchedTrainersUseCase } from "@/entities/useCaseInterfaces/users/get-match-trainer.usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  TrainerApprovalStatus,
} from "@/shared/constants";
import { ITrainerEntity } from "@/entities/models/trainer.entity";

@injectable()
export class GetMatchedTrainersUseCase implements IGetMatchedTrainersUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string): Promise<ITrainerEntity[]> {
    if (!clientId) {
      throw new CustomError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
    }

    const client = await this._clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!client.matchedTrainers || client.matchedTrainers.length === 0) {
      throw new CustomError(ERROR_MESSAGES.NO_MATCHING_TRAINERS, HTTP_STATUS.BAD_REQUEST);
    }

    const { items: trainers } = await this._trainerRepository.find(
      {
        _id: { $in: client.matchedTrainers },
        approvalStatus: TrainerApprovalStatus.APPROVED
      },
      0,
      client.matchedTrainers.length
    );

    return trainers;
  }
}
