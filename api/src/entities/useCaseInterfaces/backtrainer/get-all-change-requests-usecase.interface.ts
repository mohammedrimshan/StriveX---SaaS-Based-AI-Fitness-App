import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";

export interface IGetAllChangeRequestsUseCase {
  execute(skip: number, limit: number, status?: string): Promise<{ items: ITrainerChangeRequestEntity[]; total: number }>;
}