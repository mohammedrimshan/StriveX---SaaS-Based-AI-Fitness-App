import { IClientProgressHistoryEntity } from "@/entities/models/clientprogresshistory.model";

export interface IClientProgressHistoryRepository {
  save(data: Partial<IClientProgressHistoryEntity>): Promise<IClientProgressHistoryEntity>;
  findLatestByUserId(userId: string): Promise<IClientProgressHistoryEntity | null>; 
}