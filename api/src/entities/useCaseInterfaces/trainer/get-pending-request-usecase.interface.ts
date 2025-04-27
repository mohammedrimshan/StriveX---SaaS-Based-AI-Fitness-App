import { PaginatedUsers } from "@/entities/models/paginated-users.entity";
import { IClientEntity } from "@/entities/models/client.entity";

export interface IGetPendingClientRequestsUseCase {
  execute(
    trainerId: string,
    pageNumber: number,
    pageSize: number
  ): Promise<PaginatedUsers<IClientEntity>>;
}