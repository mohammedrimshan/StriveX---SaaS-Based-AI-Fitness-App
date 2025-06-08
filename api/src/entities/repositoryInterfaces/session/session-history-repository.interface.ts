import { IBaseRepository } from "../base-repository.interface";
import { ISessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";

export interface ISessionHistoryRepository extends IBaseRepository<ISessionHistoryModel> {
  
}