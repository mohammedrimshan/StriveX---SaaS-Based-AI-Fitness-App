import { inject, injectable } from "tsyringe";
import { IGetAllChangeRequestsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-all-change-requests-usecase.interface";
import { ITrainerChangeRequestRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/trainerchangerequest.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";
@injectable()
export class GetAllChangeRequestsUseCase implements IGetAllChangeRequestsUseCase {
  constructor(
    @inject("ITrainerChangeRequestRepository") private changeRequestRepository: ITrainerChangeRequestRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(skip: number, limit: number, status?: string): Promise<{ items: ITrainerChangeRequestEntity[]; total: number }> {
    const filter = status ? { status } : {};
    const requests = await this.changeRequestRepository.find(filter, skip, limit);

    // Enrich requests with client and trainer details
    const enrichedItems = await Promise.all(
      requests.items.map(async (request) => {
        const client = await this.clientRepository.findById(request.clientId);
        const trainer = await this.trainerRepository.findById(request.backupTrainerId);
        return {
          ...request,
          client: client ? {
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
            profileImage: client.profileImage
          } : null,
          backupTrainer: trainer ? {
            id: trainer.id,
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            profileImage: trainer.profileImage
          } : null
        };
      })
    );

    return {
      items: enrichedItems,
      total: requests.total
    };
  }
}