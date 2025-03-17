import { PaginatedUsers } from "../../models/paginated-users.entity";

export interface IGetAllUsersUseCase {
  execute(
    userType: string,
    pageNumber: number,
    pageSize: number,
    searchTerm: string
  ): Promise<PaginatedUsers>;
}
