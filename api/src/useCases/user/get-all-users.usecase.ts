import { inject, injectable } from "tsyringe";
import { PaginatedUsers } from "@/entities/models/paginated-users.entity";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { calculatePagination } from "@/shared/utils/pagination";

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
    const { skip, limit, page } = calculatePagination({ page: pageNumber, limit: pageSize });

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

    let items: any[] = [];
    let total = 0;

    if (userType === "client") {
      ({ items, total } = await this._clientRepository.find(filter, skip, limit));
    } else if (userType === "trainer") {
      ({ items, total } = await this._trainerRepository.find(filter, skip, limit));
    } else {
      throw new CustomError(
        "Invalid user type. Expected 'client' or 'trainer'.",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const totalPages = Math.ceil(total / limit);

    return {
      user: items,
      total: totalPages,
    };
  }
}
