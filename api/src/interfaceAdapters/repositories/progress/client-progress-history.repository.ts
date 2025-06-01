import { injectable } from "tsyringe";
import { Model, Types } from "mongoose";
import { IClientProgressHistoryRepository } from "@/entities/repositoryInterfaces/progress/client-progress-history-repository.interface";
import { IClientProgressHistoryEntity } from "@/entities/models/clientprogresshistory.model";
import { ClientProgressHistoryModel, IClientProgressHistoryModel } from "@/frameworks/database/mongoDB/models/client.progress.history.model";
import { BaseRepository } from "../base.repository";

@injectable()
export class ClientProgressHistoryRepository
  extends BaseRepository<IClientProgressHistoryEntity>
  implements IClientProgressHistoryRepository
{
  constructor() {
    super(ClientProgressHistoryModel);
  }

  async findLatestByUserId(userId: string): Promise<IClientProgressHistoryEntity | null> {
    const latestEntry = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .lean();
    return latestEntry ? this.mapToEntity(latestEntry) : null;
  }

  protected mapToEntity(doc: any): IClientProgressHistoryEntity {
    const { _id, __v, userId, ...rest } = doc;
    return {
      ...rest,
      userId: userId?.toString(),
      id: _id?.toString(),
    } as IClientProgressHistoryEntity;
  }
}