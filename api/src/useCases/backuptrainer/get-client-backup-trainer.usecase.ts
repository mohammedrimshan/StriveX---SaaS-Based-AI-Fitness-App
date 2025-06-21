// D:\StriveX\api\src\useCases\backupTrainer\get-client-backup-trainer.usecase.ts
import { inject, injectable } from "tsyringe";
import { IGetClientBackupTrainerUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-client-backup-trainer-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetClientBackupTrainerUseCase
  implements IGetClientBackupTrainerUseCase
{
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string): Promise<IClientEntity> {
    const client = await this.clientRepository.findByClientId(clientId);
    if (!client) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (client.backupTrainerId) {
      const backupTrainer = await this.trainerRepository.findById(
        client.backupTrainerId
      );
      if (
        backupTrainer &&
        backupTrainer.id &&
        backupTrainer.firstName &&
        backupTrainer.lastName
      ) {
        client.backupTrainer = {
          id: backupTrainer.id,
          firstName: backupTrainer.firstName,
          lastName: backupTrainer.lastName,
          profileImage: backupTrainer.profileImage,
          specialization: backupTrainer.specialization,
        };
      } else {
        throw new CustomError(
          "Invalid backup trainer data",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    }

    return client;
  }
}
