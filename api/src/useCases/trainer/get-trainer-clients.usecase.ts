import { inject, injectable } from "tsyringe";
import { IGetTrainerClientsUseCase } from "@/entities/useCaseInterfaces/trainer/get-clients-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { PaginatedUsers } from "@/entities/models/paginated-users.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, TrainerSelectionStatus } from "@/shared/constants";

@injectable()
export class GetTrainerClientsUseCase implements IGetTrainerClientsUseCase {
  constructor(
    @inject("IClientRepository")
    private _clientRepository: IClientRepository
  ) {}

  async execute(trainerId: string, pageNumber: number, pageSize: number): Promise<PaginatedUsers> {
    if (pageNumber < 1 || pageSize < 1) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const { items: preferences, total } = await this._clientRepository.find(
      { selectedTrainerId: trainerId, status: TrainerSelectionStatus.ASSIGNED },
      (pageNumber - 1) * pageSize,
      pageSize
    );

    const userData = await Promise.all(
      preferences.map(async pref => {
        const client = await this._clientRepository.findByClientId(pref.clientId);
        return {
          id: pref.id,
          client: client ? `${client.firstName} ${client.lastName}` : "Unknown",
          preferences: {
            workoutType: pref.preferredWorkout,
            fitnessGoal: pref.fitnessGoal,
            skillLevel: pref.experienceLevel,
            skillsToGain: pref.skillsToGain,
          },
          status: pref.status,
        };
      })
    );

    return {
      user: userData,
      total: Math.ceil(total / pageSize),
    };
  }
}