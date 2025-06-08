import { injectable } from "tsyringe";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { PaymentModel } from "@/frameworks/database/mongoDB/models/payment.model";
import { BaseRepository } from "../base.repository";
import { FilterQuery, PipelineStage } from "mongoose";
import { PaymentStatus } from "@/shared/constants";

@injectable()
export class PaymentRepository
  extends BaseRepository<IPaymentEntity>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }

  async find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ items: IPaymentEntity[]; total: number }> {
    const pipeline: PipelineStage[] = [
      { $match: filter },
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

    try {
      const result = await this.model.aggregate(pipeline).exec();
      const { items, total } = result[0] || { items: [], total: 0 };
      const transformedItems = items.map((item: any) => this.mapToEntity(item));
      return { items: transformedItems, total };
    } catch (error) {
      console.error(`Error finding payments:`, error);
      throw error;
    }
  }

  async findByStripePaymentId(
    stripePaymentId: string
  ): Promise<IPaymentEntity | null> {
    try {
      const payment = await this.model.findOne({ stripePaymentId }).lean();
      if (!payment) {
        console.log(`No payment found for stripePaymentId: ${stripePaymentId}`);
        return null;
      }
      return this.mapToEntity(payment);
    } catch (error) {
      console.error(
        `Error finding payment by stripePaymentId ${stripePaymentId}:`,
        error
      );
      throw error;
    }
  }

  async findByStripeSessionId(
    stripeSessionId: string
  ): Promise<IPaymentEntity | null> {
    try {
      const payment = await this.model.findOne({ stripeSessionId }).lean();
      if (!payment) {
        console.log(`No payment found for stripeSessionId: ${stripeSessionId}`);
        return null;
      }
      return this.mapToEntity(payment);
    } catch (error) {
      console.error(
        `Error finding payment by stripeSessionId ${stripeSessionId}:`,
        error
      );
      throw error;
    }
  }

  async updatePaymentStatus(
    stripePaymentId: string,
    status: string,
    clientId?: string
  ): Promise<IPaymentEntity> {
    try {
      const updateData: any = { status };
      if (clientId) updateData.clientId = clientId;

      const payment = await this.model
        .findOneAndUpdate(
          { stripePaymentId },
          { $set: updateData },
          { new: true, lean: true }
        )
        .exec();

      if (!payment) {
        console.error(
          `Payment not found for stripePaymentId: ${stripePaymentId}`
        );
        throw new Error("Payment not found");
      }

      return this.mapToEntity(payment);
    } catch (error) {
      console.error(
        `Error updating payment status for stripePaymentId ${stripePaymentId}:`,
        error
      );
      throw error;
    }
  }

async findTrainerPaymentHistory(
  trainerId: string,
  skip: number,
  limit: number,
  status?: string
): Promise<{ items: IPaymentEntity[]; total: number }> {
  const match: any = { trainerId };
  if (status) {
    match.status = status;
  }

  const pipeline: PipelineStage[] = [
    { $match: match },

    // Lookup client details
    {
      $lookup: {
        from: "clients",
        let: { clientId: { $toObjectId: "$clientId" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$clientId"] },
            },
          },
        ],
        as: "client",
      },
    },
    {
      $unwind: {
        path: "$client",
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
        id: "$_id",
        clientId: 1,
        trainerId: 1,
        membershipPlanId: 1,
        amount: 1,
        stripePaymentId: 1,
        stripeSessionId: 1,
        trainerAmount: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,

        clientName: {
          $cond: {
            if: { $eq: [{ $ifNull: ["$client", null] }, null] },
            then: "Unknown Client",
            else: {
              $concat: [
                { $ifNull: ["$client.firstName", ""] },
                " ",
                { $ifNull: ["$client.lastName", ""] },
              ],
            },
          },
        },

        planTitle: {
          $ifNull: ["$plan.name", "Unknown Plan"],
        },

        commission: {
          $subtract: ["$amount", "$trainerAmount"],
        },
      },
    },

    // Pagination and total count
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

  try {
    const result = await this.model.aggregate(pipeline).exec();
    if (!result[0]) {
      console.warn(`No results for trainerId: ${trainerId}`);
      return { items: [], total: 0 };
    }

    const { items, total } = result[0];
    const transformedItems = items.map((item: any) => this.mapToEntity(item));
    return { items: transformedItems, total };
  } catch (error) {
    console.error(`Error fetching payment history for trainer ${trainerId}:`, error);
    throw error;
  }
}

  async updateMany(
    query: FilterQuery<IPaymentEntity>,
    update: Partial<IPaymentEntity>
  ): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(query, { $set: update }).exec();
    return { modifiedCount: result.modifiedCount };
  }
  async findOne(
    filter: Partial<IPaymentEntity>
  ): Promise<IPaymentEntity | null> {
    const result = await this.model.findOne(filter).lean();
    return result as IPaymentEntity | null;
  }
}
