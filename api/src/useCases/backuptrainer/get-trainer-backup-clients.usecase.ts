import { inject, injectable } from "tsyringe";
import { IGetTrainerBackupClientsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-trainer-backup-clients-usecase.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetTrainerBackupClientsUseCase
  implements IGetTrainerBackupClientsUseCase
{
  constructor(
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  async execute(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IClientEntity[]; total: number }> {
    const trainer = await this.trainerRepository.findTrainerWithBackupClients(trainerId);
    if (!trainer) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const clientIds = (trainer.backupClientIds || []).map((client: IClientEntity) => client.clientId);


    console.log(clientIds)
    const filter = {
      clientId: { $in: clientIds },
      backupTrainerStatus: "ACCEPTED",
    };

    const [clients, total] = await Promise.all([
      this.clientRepository.find(filter, skip, limit),
      this.clientRepository.count(filter),
    ]);

    return { items: clients.items, total };
  }
}
