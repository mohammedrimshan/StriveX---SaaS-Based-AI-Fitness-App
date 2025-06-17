import { injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import { IClientEntity } from "@/entities/models/client.entity";
import { BaseRepository } from "../base.repository";
import { PaymentStatus, TrainerSelectionStatus } from "@/shared/constants";
import { PipelineStage } from "mongoose";
import { isValidObjectId } from "mongoose";

@injectable()
export class ClientRepository
  extends BaseRepository<IClientEntity>
  implements IClientRepository
{
  constructor() {
    super(ClientModel);
  }

  async findByEmail(email: string): Promise<IClientEntity | null> {
    return this.findOneAndMap({ email });
  }

  async updateByEmail(
    email: string,
    updates: Partial<IClientEntity>
  ): Promise<IClientEntity | null> {
    return this.findOneAndUpdateAndMap({ email }, updates);
  }

  async findByClientId(clientId: string): Promise<IClientEntity | null> {
    if (!clientId || typeof clientId !== "string") {
      throw new Error("Invalid clientId");
    }
    const client = await this.model.findOne({ clientId }).lean();
    return client ? this.mapToEntity(client) : null;
  }

  async findByClientNewId(clientId: string): Promise<IClientEntity | null> {
    if (!clientId || typeof clientId !== "string") {
      throw new Error("Invalid clientId");
    }

    try {
      const query = isValidObjectId(clientId)
        ? { $or: [{ _id: clientId }, { clientId }] }
        : { clientId };

      const client = await this.model.findOne(query).lean();
      return client ? this.mapToEntity(client) : null;
    } catch (error) {
      console.error(
        `Error in findByClientNewId for clientId: ${clientId}`,
        error
      );
      return null;
    }
  }
  async updateByClientId(
    clientId: string,
    updates: Partial<IClientEntity>
  ): Promise<IClientEntity | null> {
    return this.findOneAndUpdateAndMap({ clientId }, updates);
  }

  async updatePremiumStatus(
    clientId: string,
    isPremium: boolean
  ): Promise<IClientEntity> {
    const updated = await this.findOneAndUpdateAndMap(
      { clientId },
      { isPremium }
    );
    if (!updated) throw new Error("Client not found");
    return updated;
  }

  async findByIdAndUpdate(
    id: any,
    updateData: Partial<IClientEntity>
  ): Promise<IClientEntity | null> {
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
          profileImage: 1,
          fitnessGoal: 1,
          experienceLevel: 1,
          preferredWorkout: 1,
          selectStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          trainerName: {
            $concat: ["$trainer.firstName", " ", "$trainer.lastName"],
          },
        },
      },
      {
        $facet: {
          items: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
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
    const { items, total } = result[0] || { items: [], total: 0 };
    const transformedItems = items.map((item: any) => this.mapToEntity(item));
    return { items: transformedItems, total };
  }
  async findByIds(ids: string[]): Promise<{ id: string; name: string }[]> {
    try {
      const striveXIds = ids.filter((id) => id.includes("striveX-client"));
      const mongoIds = ids.filter((id) => isValidObjectId(id));

      console.log("StriveX IDs:", striveXIds);
      console.log("MongoDB IDs:", mongoIds);

      const clients = await this.model
        .find({
          $or: [{ clientId: { $in: striveXIds } }, { _id: { $in: mongoIds } }],
        })
        .select("_id clientId firstName lastName")
        .lean();

      return clients.map((client) => {
        const matchedId = striveXIds.includes(client.clientId)
          ? client.clientId
          : (client._id as any).toString();
        return {
          id: matchedId,
          name:
            `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
            "Unknown User",
        };
      });
    } catch (error) {
      console.error(`Error finding clients by IDs: ${ids.join(", ")}`, error);
      throw error;
    }
  }

  async findAcceptedClients(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IClientEntity[] | []; total: number }> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          selectedTrainerId: trainerId,
          selectStatus: TrainerSelectionStatus.ACCEPTED,
        },
      },
      {
        $project: {
          clientId: 1,
          firstName: 1,
          lastName: 1,
          profileImage: 1,
          email: 1,
          phoneNumber: 1,
          fitnessGoal: 1,
          experienceLevel: 1,
          preferredWorkout: 1,
          selectStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          height: 1,
          weight: 1,
          status: 1,
          googleId: 1,
          activityLevel: 1,
          healthConditions: 1,
          waterIntake: 1,
          dietPreference: 1,
          isPremium: 1,
          sleepFrom: 1,
          wakeUpAt: 1,
          skillsToGain: 1,
          selectionMode: 1,
          matchedTrainers: 1,
        },
      },
      {
        $facet: {
          items: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
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
    const { items, total } = result[0] || { items: [], total: 0 };
    const transformedItems = items.map((item: any) => this.mapToEntity(item));
    return { items: transformedItems, total };
  }

  async findUserSubscriptions(
    page: number,
    limit: number,
    search?: string,
    status?: "all" | "active" | "expired"
  ): Promise<{
    items: {
      clientId: string;
      clientName: string;
      profileImage?: string;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
      isExpired: boolean;
      daysUntilExpiration: number;
      membershipPlanId?: string;
      planName?: string;
      amount?: number;
      status: string;
    }[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const match: any = { isPremium: true };

    if (search) {
      match["$or"] = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $lookup: {
          from: "payments",
          let: { clientId: "$clientId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$clientId", "$$clientId"] },
                status: PaymentStatus.COMPLETED,
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "latestPayment",
        },
      },
      {
        $unwind: {
          path: "$latestPayment",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "membershipplans",
          let: { planId: { $toObjectId: "$membershipPlanId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$planId"] },
              },
            },
          ],
          as: "plan",
        },
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          clientId: 1,
          clientName: {
            $concat: [
              { $ifNull: ["$firstName", ""] },
              " ",
              { $ifNull: ["$lastName", ""] },
            ],
          },
          profileImage: 1,
          subscriptionStartDate: 1,
          subscriptionEndDate: 1,
          isExpired: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$subscriptionEndDate", null] },
                  { $lt: [{ $toDate: "$subscriptionEndDate" }, new Date()] },
                ],
              },
              then: true,
              else: false,
            },
          },
          daysUntilExpiration: {
            $cond: {
              if: { $eq: ["$subscriptionEndDate", null] },
              then: 0,
              else: {
                $divide: [
                  {
                    $subtract: [
                      { $toDate: "$subscriptionEndDate" },
                      new Date(),
                    ],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
          membershipPlanId: 1,
          planName: { $ifNull: ["$plan.name", "Unknown Plan"] },
          amount: "$latestPayment.price",
          status: "$latestPayment.status",
        },
      },
    ];

    if (status && status !== "all") {
      pipeline.push({
        $match: {
          isExpired: status === "expired",
        },
      });
    }

    pipeline.push(
      {
        $facet: {
          items: [
            { $sort: { subscriptionStartDate: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          items: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        },
      }
    );

    try {
      const result = await this.model.aggregate(pipeline).exec();
      const { items, total } = result[0] || { items: [], total: 0 };

      return {
        items: items.map((item: any) => ({
          clientId: item.clientId,
          clientName: item.clientName.trim() || "Unknown Client",
          profileImage: item.profileImage,
          subscriptionStartDate: item.subscriptionStartDate,
          subscriptionEndDate: item.subscriptionEndDate,
          isExpired: item.isExpired,
          daysUntilExpiration: Math.round(item.daysUntilExpiration) || 0,
          membershipPlanId: item.membershipPlanId,
          planName: item.planName,
          amount: item.amount,
          status: item.status || PaymentStatus.COMPLETED,
        })),
        total,
      };
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      throw error;
    }
  }
}
