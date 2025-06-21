import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";


export interface IGetClientChangeRequestsUseCase {
  execute(clientId: string, skip: number, limit: number): Promise<{ items: ITrainerChangeRequestEntity[]; total: number }>;
}