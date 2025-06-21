import { inject, injectable } from "tsyringe";
import { IGetPendingChangeRequestsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-pending-change-requests-usecase.interface";
import { ITrainerChangeRequestRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/trainerchangerequest.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, TrainerChangeRequestStatus } from "@/shared/constants";

@injectable()
export class GetPendingChangeRequestsUseCase implements IGetPendingChangeRequestsUseCase {
  constructor(
    @inject("ITrainerChangeRequestRepository") private changeRequestRepository: ITrainerChangeRequestRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(skip: number, limit: number): Promise<{ items: ITrainerChangeRequestEntity[]; total: number }> {
    const requests = await this.changeRequestRepository.find(
      { status: TrainerChangeRequestStatus.PENDING },
      skip,
      limit
    );

    // Enrich requests with client and trainer details
    const enrichedItems = await Promise.all(
      requests.items.map(async (request) => {
        const client = await this.clientRepository.findByClientId(request.clientId);
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