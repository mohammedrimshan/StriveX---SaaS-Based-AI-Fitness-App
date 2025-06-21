import { inject, injectable } from "tsyringe";
import { IGetClientsBackupOverviewUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-clients-backup-overview-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";

@injectable()
export class GetClientsBackupOverviewUseCase implements IGetClientsBackupOverviewUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(
    skip: number,
    limit: number
  ): Promise<{ items: IClientEntity[]; total: number }> {

    const clients = await this.clientRepository.find({}, skip, limit);


    const clientsWithBackup = clients.items.filter(client => !!client.backupTrainerId);

    const enrichedItems = await Promise.all(
      clientsWithBackup.map(async (client) => {
        if (client.backupTrainerId) {
          const backupTrainer = await this.trainerRepository.findById(client.backupTrainerId);
          if (backupTrainer?.id && backupTrainer.firstName && backupTrainer.lastName) {
            client.backupTrainer = {
              id: backupTrainer.id,
              firstName: backupTrainer.firstName,
              lastName: backupTrainer.lastName,
              profileImage: backupTrainer.profileImage,
              specialization: backupTrainer.specialization,
            };
          } else {
            client.backupTrainer = null;
          }
        }
        return client;
      })
    );


    return { items: enrichedItems, total: clientsWithBackup.length };
  }
}
