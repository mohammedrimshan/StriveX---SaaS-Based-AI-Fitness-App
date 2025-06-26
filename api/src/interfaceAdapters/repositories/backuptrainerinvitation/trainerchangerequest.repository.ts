import { injectable } from "tsyringe";
import { ITrainerChangeRequestEntity } from "@/entities/models/trainerchangerequest.entity";
import { ITrainerChangeRequestRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/trainerchangerequest.repository.interface";
import { TrainerChangeRequestModel } from "@/frameworks/database/mongoDB/models/trainerchangerequest.model";
import { BaseRepository } from "../base.repository";
import { TrainerChangeRequestStatus } from "@/shared/constants";

@injectable()
export class TrainerChangeRequestRepository
  extends BaseRepository<ITrainerChangeRequestEntity>
  implements ITrainerChangeRequestRepository
{
  constructor() {
    super(TrainerChangeRequestModel);
  }

  async findByClientId(
    clientId: string
  ): Promise<ITrainerChangeRequestEntity[]> {
    const requests = await this.model.find({ clientId }).lean();
    return requests.map((req) => this.mapToEntity(req));
  }

  async findPendingRequests(): Promise<ITrainerChangeRequestEntity[]> {
    const requests = await this.model
      .find({ status: TrainerChangeRequestStatus.PENDING })
      .lean();
    return requests.map((req) => this.mapToEntity(req));
  }

  async updateStatus(
    id: string,
    status: TrainerChangeRequestStatus,
    resolvedBy?: string
  ): Promise<ITrainerChangeRequestEntity | null> {
    const updates: Partial<ITrainerChangeRequestEntity> = {
      status,
      resolvedAt: new Date(),
      resolvedBy,
    };
    return this.findOneAndUpdateAndMap({ _id: id }, updates);
  }
}
