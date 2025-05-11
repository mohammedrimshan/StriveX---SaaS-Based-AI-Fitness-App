import { inject, injectable } from "tsyringe";
import { IAutoMatchTrainerUseCase } from "@/entities/useCaseInterfaces/users/automatch-trainer-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  TrainerSelectionStatus,
  TrainerApprovalStatus,
} from "@/shared/constants";

@injectable()
export class AutoMatchTrainerUseCase implements IAutoMatchTrainerUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string): Promise<IClientEntity> {
    const client = await this._clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(
        ERROR_MESSAGES.PREFERENCES_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (client.selectionMode !== "auto") {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_SELECTION_MODE,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const { items: trainers } = await this._trainerRepository.find(
      { approvalStatus: TrainerApprovalStatus.APPROVED },
      0,
      100
    );

    if (!trainers.length) {
      throw new CustomError(
        ERROR_MESSAGES.NO_MATCHING_TRAINERS,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const scoredTrainers = await this._scoreAndRankTrainers(client, trainers);

    const topTrainers = scoredTrainers
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.trainer.id)
      .filter((id): id is string => typeof id === "string");

    if (!topTrainers.length) {
      throw new CustomError(
        ERROR_MESSAGES.NO_MATCHING_TRAINERS,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const updatedClient = await this._clientRepository.update(clientId, {
      matchedTrainers: topTrainers,
      selectedTrainerId: topTrainers[0],
      selectStatus: TrainerSelectionStatus.PENDING,
    });

    if (!updatedClient) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_TO_UPDATE_PREFERENCES,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedClient;
  }

  private async _scoreAndRankTrainers(client: IClientEntity, trainers: any[]) {
    return Promise.all(
      trainers.map(async (trainer) => {
        const skillMatchCount = client.skillsToGain.filter((skill) =>
          trainer.skills?.includes(skill)
        ).length;

        const workoutMatch = trainer.specialization?.includes(
          client.preferredWorkout ?? ""
        )
          ? 1
          : 0;

        const clientCount = await this._clientRepository
          .find(
            {
              selectedTrainerId: trainer.id,
              selectStatus: TrainerSelectionStatus.ASSIGNED,
            },
            0,
            0
          )
          .then((res) => res.total);

        const score =
          skillMatchCount * 2 +
          workoutMatch * 3 +
          -clientCount * 0.5;

        return { trainer, score };
      })
    );
  }
}
