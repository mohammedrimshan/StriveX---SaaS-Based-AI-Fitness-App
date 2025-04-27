import { PaginatedUsers } from "@/entities/models/paginated-users.entity";

export interface IGetTrainerClientsUseCase {
    execute(trainerId: string, pageNumber: number, pageSize: number): Promise<PaginatedUsers>;
  }