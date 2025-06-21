import { ITrainerEarningsEntity } from "@/entities/models/trainer-earnings.entity";
import { IBaseRepository } from "../base-repository.interface";
export interface ITrainerEarningsRepository  extends IBaseRepository<ITrainerEarningsEntity> {
  findByTrainerId(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{
    items: ITrainerEarningsEntity[];
    total: number;
  }>;
}
