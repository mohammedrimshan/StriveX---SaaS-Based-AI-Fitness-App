import { ITrainerChangeRequestEntity } from "../../models/trainerchangerequest.entity";

export interface IGetPendingChangeRequestsUseCase {
  execute(skip: number, limit: number): Promise<{ items: ITrainerChangeRequestEntity[]; total: number }>;
}