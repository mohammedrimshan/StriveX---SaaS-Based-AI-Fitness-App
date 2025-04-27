import { inject, injectable } from "tsyringe";
import { IGetPendingClientRequestsUseCase } from "@/entities/useCaseInterfaces/trainer/get-pending-request-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { PaginatedUsers } from "@/entities/models/paginated-users.entity";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES, TrainerSelectionStatus } from "@/shared/constants";

@injectable()
export class GetPendingClientRequestsUseCase implements IGetPendingClientRequestsUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository
  ) {}

  async execute(
    trainerId: string,
    pageNumber: number,
    pageSize: number
  ): Promise<PaginatedUsers<IClientEntity>> {
    if (pageNumber < 1 || pageSize < 1) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const { items: clients, total } = await this._clientRepository.findTrainerRequests(
      trainerId,
      (pageNumber - 1) * pageSize,
      pageSize
    );

console.log(clients,"Clients....")

    return {
      user: clients,
      total: Math.ceil(total / pageSize),
    } as PaginatedUsers<IClientEntity>;
  }
}