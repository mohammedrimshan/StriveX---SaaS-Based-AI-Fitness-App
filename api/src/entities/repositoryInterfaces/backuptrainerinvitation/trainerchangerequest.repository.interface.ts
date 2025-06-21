import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";
import { IBaseRepository } from "../base-repository.interface";
import { TrainerChangeRequestStatus } from "@/shared/constants";

export interface ITrainerChangeRequestRepository extends IBaseRepository<ITrainerChangeRequestEntity> {
  findByClientId(clientId: string): Promise<ITrainerChangeRequestEntity[]>;
  findPendingRequests(): Promise<ITrainerChangeRequestEntity[]>;
  updateStatus(id: string, status: TrainerChangeRequestStatus, resolvedBy?: string): Promise<ITrainerChangeRequestEntity | null>;
}