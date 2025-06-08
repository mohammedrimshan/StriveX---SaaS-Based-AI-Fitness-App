import { ISessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";

export interface IGetSessionHistoryUseCase {
  execute(
    userId: string,
    role: "trainer" | "client" | "admin",
    skip: number,
    limit: number
  ): Promise<{ items: ISessionHistoryModel[]; total: number }>;
}