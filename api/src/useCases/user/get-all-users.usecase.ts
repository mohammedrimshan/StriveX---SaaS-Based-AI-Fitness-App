import { inject, injectable } from "tsyringe";
import { PaginatedUsers } from "@/entities/models/paginated-users.entity";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(
    userType: string,
    pageNumber: number,
    pageSize: number,
    searchTerm: string
  ): Promise<PaginatedUsers> {
    let filter: any = {};
    if (userType) {
      filter.role = userType; 
    }

    if (searchTerm) {
      filter.$or = [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const validPageNumber = Math.max(1, pageNumber);
    const validPageSize = Math.max(1, pageSize);
    const skip = (validPageNumber - 1) * validPageSize;
    const limit = validPageSize;

    if (userType === "client") {
      const { items:user, total } = await this._clientRepository.find(filter, skip, limit);
      return {
        user,
        total: Math.ceil(total / validPageSize),
      };
    }
    if (userType === "trainer") {
      const { items:trainers, total } = await this._trainerRepository.find(filter, skip, limit);
      return {
        user: trainers, // Normalized to 'user' for PaginatedUsers
        total: Math.ceil(total / validPageSize),
      };
    }

    throw new CustomError(
      "Invalid user type. Expected 'client' or 'trainer'.",
      HTTP_STATUS.BAD_REQUEST
    );
  }
}