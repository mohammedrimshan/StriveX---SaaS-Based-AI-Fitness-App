import { injectable } from "tsyringe";
import { ITrainerEarningsEntity } from "@/entities/models/trainer-earnings.entity";
import { TrainerEarningsModel } from "@/frameworks/database/mongoDB/models/trainer-earnings.model";
import { BaseRepository } from "../base.repository";
import { ITrainerEarningsRepository } from "@/entities/repositoryInterfaces/trainer/trainer-earnings.repository.interface";
import { PipelineStage } from "mongoose";

@injectable()
export class TrainerEarningsRepository extends BaseRepository<ITrainerEarningsEntity> implements ITrainerEarningsRepository {
  constructor() {
    super(TrainerEarningsModel);
  }

  async findByTrainerId(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: ITrainerEarningsEntity[]; total: number }> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          trainerId,
        },
      },
      {
        $facet: {
          items: [
            { $sort: { completedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          total: [
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          items: 1,
          total: {
            $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0],
          },
        },
      },
    ];

    const result = await this.model.aggregate(pipeline).exec();
    const { items, total } = result[0] || { items: [], total: 0 };

    return {
      items: items.map(this.mapToEntity),
      total,
    };
  }
}
