import { PaginatedUsers } from "@/entities/models/paginated-users.entity";
import { TrainerRequestUser } from "@/entities/models/trainer.request.interface";
export interface IGetTrainerRequestsUseCase {
    execute(pageNumber: number, pageSize: number, searchTerm: string): Promise<PaginatedUsers<TrainerRequestUser>>;
  }
  