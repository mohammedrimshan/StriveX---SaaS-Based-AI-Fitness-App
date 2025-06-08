import { injectable } from "tsyringe";
import { SessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";
import { ISessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";
import { BaseRepository } from "../base.repository";
import { ISessionHistoryRepository } from "@/entities/repositoryInterfaces/session/session-history-repository.interface";

@injectable()
export class SessionHistoryRepository extends BaseRepository<ISessionHistoryModel> implements ISessionHistoryRepository {
  constructor() {
    super(SessionHistoryModel);
  }
}