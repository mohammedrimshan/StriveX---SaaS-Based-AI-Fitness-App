import { inject, injectable } from "tsyringe";
import { IGetClientChangeRequestsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-client-change-requests-usecase.interface";
import { ITrainerChangeRequestRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/trainerchangerequest.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetClientChangeRequestsUseCase implements IGetClientChangeRequestsUseCase {
  constructor(
    @inject("ITrainerChangeRequestRepository") private changeRequestRepository: ITrainerChangeRequestRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string, skip: number, limit: number): Promise<{ items: ITrainerChangeRequestEntity[]; total: number }> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const requests = await this.changeRequestRepository.findByClientId(clientId);
    const total = requests.length;
    const paginatedItems = requests.slice(skip, skip + limit);

    // Enrich requests with trainer details
    const enrichedItems = await Promise.all(
      paginatedItems.map(async (request) => {
        const trainer = await this.trainerRepository.findById(request.backupTrainerId);
        return {
          ...request,
          backupTrainer: trainer ? {
            id: trainer.id,
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            profileImage: trainer.profileImage
          } : null
        };
      })
    );

    return { items: enrichedItems, total };
  }
}