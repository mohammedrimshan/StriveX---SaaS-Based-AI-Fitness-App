import { IProgressEntity } from "@/entities/models/progress.entity";

export interface IRecordProgressUseCase {
  execute(progress: Omit<IProgressEntity, '_id'>): Promise<IProgressEntity>;
}