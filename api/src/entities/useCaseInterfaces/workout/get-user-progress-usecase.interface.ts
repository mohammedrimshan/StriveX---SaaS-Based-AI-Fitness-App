
import { IProgressEntity } from "@/entities/models/progress.entity";



export interface IGetUserProgressUseCase {
  execute(userId: string): Promise<IProgressEntity[]>;
}