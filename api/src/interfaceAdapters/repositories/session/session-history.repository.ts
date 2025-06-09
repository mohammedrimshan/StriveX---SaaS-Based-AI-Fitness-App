import { injectable } from "tsyringe";
import { SessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";
import { ISessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";
import { BaseRepository } from "../base.repository";
import { ISessionHistoryRepository } from "@/entities/repositoryInterfaces/session/session-history-repository.interface";

@injectable()
export class SessionHistoryRepository
  extends BaseRepository<ISessionHistoryModel>
  implements ISessionHistoryRepository
{
  constructor() {
    super(SessionHistoryModel);
  }

  async getPerformanceStats(trainerId: string): Promise<{
    sessionsCompleted: number;
    clientsTrained: number;
    successRate: number;
  }> {
    const [completed, total, uniqueClients] = await Promise.all([
      this.model.countDocuments({ trainerId, videoCallStatus: "ended" }),
      this.model.countDocuments({ trainerId }),
      this.model.distinct("clientId", { trainerId, videoCallStatus: "ended" }),
    ]);

    const successRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      sessionsCompleted: completed,
      clientsTrained: uniqueClients.length,
      successRate,
    };
  }
}
