import { injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import { IClientEntity } from "@/entities/models/client.entity";
import { BaseRepository } from "../base.repository";
import { TrainerSelectionStatus } from "@/shared/constants";
import { PipelineStage } from "mongoose";

@injectable()
export class ClientRepository extends BaseRepository<IClientEntity> implements IClientRepository {
  constructor() {
    super(ClientModel);
  }

  async findByEmail(email: string): Promise<IClientEntity | null> {
    return this.findOneAndMap({ email });
  }

  async updateByEmail(email: string, updates: Partial<IClientEntity>): Promise<IClientEntity | null> {
    return this.findOneAndUpdateAndMap({ email }, updates);
  }

  async findByClientId(clientId: string): Promise<IClientEntity | null> {
    console.log(`Querying client with clientId: ${clientId}`);
    const doc = await this.model.findOne({ clientId }).lean();
    console.log(`Query result: ${JSON.stringify(doc)}`);
    return doc ? this.mapToEntity(doc) : null;
  }

  async updateByClientId(clientId: string, updates: Partial<IClientEntity>): Promise<IClientEntity | null> {
    console.log(`Updating clientId: ${clientId} with data: ${JSON.stringify(updates)}`);
    const updated = await this.findOneAndUpdateAndMap({ clientId }, updates);
    console.log(`Update result: ${JSON.stringify(updated)}`);
    return updated;
  }

  async updatePremiumStatus(clientId: string, isPremium: boolean): Promise<IClientEntity> {
    const updated = await this.findOneAndUpdateAndMap({ clientId }, { isPremium });
    if (!updated) throw new Error("Client not found");
    return updated;
  }

  async findByIdAndUpdate(id: any, updateData: Partial<IClientEntity>): Promise<IClientEntity | null> {
    const client = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();
    return client ? this.mapToEntity(client) : null;
  }

  async findByIdAndUpdatePassword(id: any, password: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { password });
  }

  async findTrainerRequests(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IClientEntity[] | []; total: number }> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          selectedTrainerId: trainerId,
          selectStatus: TrainerSelectionStatus.PENDING,
        },
      },
      {
        $lookup: {
          from: "trainers",
          localField: "selectedTrainerId",
          foreignField: "_id",
          as: "trainer",
        },
      },
      {
        $unwind: {
          path: "$trainer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          clientId: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          fitnessGoal: 1,
          experienceLevel: 1,
          preferredWorkout: 1,
          selectStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          trainerName: { $concat: ["$trainer.firstName", " ", "$trainer.lastName"] },
        },
      },
      {
        $facet: {
          items: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          items: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        },
      },
    ];

    const result = await this.model.aggregate(pipeline).exec();
    console.log("Aggregation result:", result);
    const { items, total } = result[0] || { items: [], total: 0 };
    const transformedItems = items.map((item: any) => this.mapToEntity(item));
    return { items: transformedItems, total };
  }
}
