import { IBaseRepository } from "../base-repository.interface";
import { ISessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";

export interface ISessionHistoryRepository extends IBaseRepository<ISessionHistoryModel> {
  getPerformanceStats(trainerId: string): Promise<{
    sessionsCompleted: number;
    clientsTrained: number;
    successRate?: number;
  }>
}