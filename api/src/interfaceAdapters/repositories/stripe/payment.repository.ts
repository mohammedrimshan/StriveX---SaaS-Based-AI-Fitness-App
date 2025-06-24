import { injectable } from "tsyringe";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { PaymentModel } from "@/frameworks/database/mongoDB/models/payment.model";
import { BaseRepository } from "../base.repository";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { ITrainerEarningsEntity } from "@/entities/models/trainer-earnings.entity";
import { TrainerEarningsModel } from "@/frameworks/database/mongoDB/models/trainer-earnings.model";
import { ClientSession } from "mongoose";

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
        throw new CustomError("Payment not found", HTTP_STATUS.NOT_FOUND);
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
    limit: number
  ): Promise<{
    items: {
      clientName: string;
      planTitle: string;
      trainerAmount: number;
      adminShare: number;
      completedAt: Date;
    }[];
    total: number;
  }> {
    const pipeline: PipelineStage[] = [
      { $match: { trainerId } },

      // Join with client
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
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },

      // Join with membership plan
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
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },

      // Final projection for table
      {
        $project: {
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
          planTitle: { $ifNull: ["$plan.name", "Unknown Plan"] },
          trainerAmount: "$trainerShare",
          adminShare: "$adminShare",
          completedAt: 1,
        },
      },

      // Paginate and count
      {
        $facet: {
          items: [
            { $sort: { completedAt: -1 } },
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

    const result = await TrainerEarningsModel.aggregate(pipeline).exec();
    const { items, total } = result[0] || { items: [], total: 0 };
    return { items, total };
  }

  async updateMany(
    query: FilterQuery<IPaymentEntity>,
    update: Partial<IPaymentEntity>
  ): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(query, { $set: update }).exec();
    return { modifiedCount: result.modifiedCount };
  }

  async findOne(
    filter: Partial<IPaymentEntity>,
    sort?: Record<string, 1 | -1>
  ): Promise<IPaymentEntity | null> {
    try {
      let query = this.model.findOne(filter);
      if (sort) {
        query = query.sort(sort);
      }
      const result = await query.lean();
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error(`Error finding payment with filter:`, filter, error);
      throw error;
    }
  }

  async updateById(id: string, data: Partial<IPaymentEntity>): Promise<void> {
    try {
      const result = await this.update(id, data);
      if (!result) {
        throw new CustomError("Payment not found", HTTP_STATUS.NOT_FOUND);
      }
    } catch (error) {
      console.error(`Error updating payment with id ${id}:`, error);
      throw error;
    }
  }

  async updatePayment(
    id: string,
    updates: Partial<IPaymentEntity>,
    session?: ClientSession
  ): Promise<IPaymentEntity | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(
          `[${new Date().toISOString()}] Invalid ObjectId for payment update: ${id}`
        );
        throw new CustomError(
          `Invalid payment ID: ${id}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const updateData = { ...updates, updatedAt: new Date() };
      const options = { new: true, session, lean: true };
      const entity = await this.model
        .findByIdAndUpdate(id, { $set: updateData }, options)
        .exec();
      if (!entity) {
        console.error(
          `[${new Date().toISOString()}] Payment not found for update: ${id}`
        );
        return null;
      }
      console.log(
        `[${new Date().toISOString()}] Updated payment ${id}: ${JSON.stringify(
          entity
        )}`
      );
      return this.mapToEntity(entity);
    } catch (error: any) {
      console.error(
        `[${new Date().toISOString()}] Error updating payment ${id}: ${
          error.message
        }`
      );
      throw new CustomError(
        `Failed to update payment ${id}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
  async deleteById(id: string): Promise<void> {
    await PaymentModel.findByIdAndDelete(id);
  }
}
