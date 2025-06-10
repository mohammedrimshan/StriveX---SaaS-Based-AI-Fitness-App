import { injectable } from "tsyringe";
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import {
  ClientModel,
  IClientModel,
} from "@/frameworks/database/mongoDB/models/client.model";
import {
  TrainerModel,
  ITrainerModel,
} from "@/frameworks/database/mongoDB/models/trainer.model";
import {
  PaymentModel,
  IPaymentModel,
} from "@/frameworks/database/mongoDB/models/payment.model";
import {
  SessionHistoryModel,
  ISessionHistoryModel,
} from "@/frameworks/database/mongoDB/models/session-history.model";
import {
  ReviewModel,
  IReviewModel,
} from "@/frameworks/database/mongoDB/models/review.model";
import {
  WorkoutModel,
  IWorkoutModel,
} from "@/frameworks/database/mongoDB/models/workout.model";
import {
  WorkoutProgressModel,
  IWorkoutProgressModel,
} from "@/frameworks/database/mongoDB/models/workout-progress.model";
import {
  CategoryModel,
  ICategoryModel,
} from "@/frameworks/database/mongoDB/models/category.model";
import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import {
  IClientFeedback,
  IClientProgress,
  IEarningsReport,
  ISessionHistory,
  ITrainerDashboardStats,
  IUpcomingSession,
  IWeeklySessionStats,
} from "@/entities/models/trainer-dashboard.entity";
import { Types } from "mongoose";
import {
  ISlotModel,
  SlotModel,
} from "@/frameworks/database/mongoDB/models/slot.model";
import mongoose from "mongoose";

@injectable()
export class TrainerDashboardRepository
  extends BaseRepository<typeof PaymentModel>
  implements ITrainerDashboardRepository
{
  private clientModel: Model<IClientModel>;
  private trainerModel: Model<ITrainerModel>;
  private paymentModel: Model<IPaymentModel>;
  private sessionHistoryModel: Model<ISessionHistoryModel>;
  private reviewModel: Model<IReviewModel>;
  private workoutModel: Model<IWorkoutModel>;
  private workoutProgressModel: Model<IWorkoutProgressModel>;
  private categoryModel: Model<ICategoryModel>;
  private slotModel: Model<ISlotModel>;

  constructor() {
    super(PaymentModel);
    this.clientModel = ClientModel;
    this.trainerModel = TrainerModel;
    this.paymentModel = PaymentModel;
    this.sessionHistoryModel = SessionHistoryModel;
    this.reviewModel = ReviewModel;
    this.workoutModel = WorkoutModel;
    this.workoutProgressModel = WorkoutProgressModel;
    this.categoryModel = CategoryModel;
    this.slotModel = SlotModel;
  }

  async getDashboardStats(
    trainerId: string,
    year: number,
    month: number
  ): Promise<ITrainerDashboardStats> {
    const trainerObjectId = new Types.ObjectId(trainerId);
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const todayISO = now.toISOString().split("T")[0];
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const [clientCount, sessionCount, earnings, avgRating, upcomingSessions] =
      await Promise.all([
        this.clientModel.countDocuments({
          selectedTrainerId: trainerId,
          selectStatus: "accepted",
        }),
        this.sessionHistoryModel.countDocuments({
          trainerId,
          videoCallStatus: "ended",
        }),
        this.paymentModel
          .aggregate([
            {
              $match: {
                trainerId: trainerId, // make sure this is a string if stored as string
                status: "completed",
                createdAt: { $gte: monthStart, $lte: monthEnd },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$trainerAmount" },
              },
            },
          ])
          .exec(),
        this.reviewModel
          .aggregate([
            { $match: { trainerId } },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } },
          ])
          .exec(),
        this.slotModel.countDocuments({
          trainerId: trainerObjectId,
          status: "booked",
          date: { $gte: todayISO },
        }),
      ]);

    console.log({
      monthStart,
      monthEnd,
      trainerId,
      earnings,
    });
    return {
      totalClients: clientCount,
      totalSessions: sessionCount,
      earningsThisMonth: earnings[0]?.total || 0,
      averageRating: avgRating[0]?.avgRating || 0,
      upcomingSessions: upcomingSessions,
    };
  }

  async getUpcomingSessions(
    trainerId: string,
    limit: number = 5
  ): Promise<IUpcomingSession[]> {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 5;

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const todayString = now.toISOString().split("T")[0];

    const trainerObjectId = new Types.ObjectId(trainerId);

    console.log("Filtering for date >= ", todayString);
    console.log("Trainer ObjectId: ", trainerObjectId);

    const result = await this.slotModel
      .aggregate([
        {
          $match: {
            trainerId: trainerObjectId,
            status: "booked",
            date: { $gte: todayString },
          },
        },
        {
          $addFields: {
            clientObjectId: { $toObjectId: "$clientId" },
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "clientObjectId",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        {
          $project: {
            date: 1,
            startTime: 1,
            endTime: 1,
            clientName: {
              $concat: ["$client.firstName", " ", "$client.lastName"],
            },
            
            clientId: "$client._id",
            profileImage: "$client.profileImage",
          },
        },
        { $sort: { date: 1, startTime: 1 } },
        { $limit: safeLimit },
      ])
      .exec();

    console.log("Aggregation result:", result);

    return result.map((item) => ({
      id: item._id.toString(),
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      clientName: item.clientName,
      clientId: item.clientId.toString(),
       profileImage: item.profileImage ?? null,
    }));
  }

  async getWeeklySessionStats(
    trainerId: string,
    year: number,
    month: number
  ): Promise<IWeeklySessionStats[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateString = startDate.toISOString().split("T")[0];
    const endDateString = endDate.toISOString().split("T")[0];

    const result = await this.sessionHistoryModel
      .aggregate([
        {
          $match: {
            trainerId: new mongoose.Types.ObjectId(trainerId),
            status: "booked",
            date: { $gte: startDateString, $lte: endDateString },
          },
        },
        {
          $lookup: {
            from: "workoutprogresses",
            localField: "_id",
            foreignField: "sessionId",
            as: "progress",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "progress.categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $group: {
            _id: {
              week: {
                $week: {
                  $dateFromString: { dateString: "$date", format: "%Y-%m-%d" },
                },
              },
              category: { $arrayElemAt: ["$category.title", 0] },
            },
            totalSessions: { $sum: 1 },
          },
        },
        {
          $project: {
            week: "$_id.week",
            category: "$_id.category",
            totalSessions: 1,
            _id: 0,
          },
        },
        { $sort: { week: 1 } },
      ])
      .exec();

    return result;
  }

  async getClientFeedback(
    trainerId: string,
    limit: number = 5
  ): Promise<IClientFeedback[]> {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 5;

    const result = await this.reviewModel
      .aggregate([
        { $match: { trainerId: trainerId.toString() } },
        {
          $project: {
            rating: 1,
            comment: 1,
            createdAt: 1,
            clientName: 1,
            clientProfileImage: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: safeLimit },
      ])
      .exec();

    return result.map((item) => ({
      id: item._id.toString(),
      rating: item.rating,
      comment: item.comment,
      clientName: item.clientName,
      clientProfileImage: item.clientProfileImage,
      createdAt: item.createdAt,
    }));
  }

  async getEarningsReport(
    trainerId: string,
    year: number,
    month: number
  ): Promise<IEarningsReport> {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const commissionRate = 0.8; // 80% commission

    const result = await this.paymentModel
      .aggregate([
        {
          $match: {
            trainerId,
            status: "completed",
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$trainerAmount" },
            totalPayments: { $sum: "$amount" },
          },
        },
        {
          $project: {
            totalEarnings: 1,
            platformCommission: {
              $multiply: ["$totalPayments", 1 - commissionRate],
            },
            _id: 0,
          },
        },
      ])
      .exec();

    return {
      totalEarnings: result[0]?.totalEarnings || 0,
      platformCommission: result[0]?.platformCommission || 0,
    };
  }

  async getClientProgress(
    trainerId: string,
    limit: number = 3
  ): Promise<IClientProgress[]> {
    const result = await this.workoutProgressModel
      .aggregate([
        {
          $lookup: {
            from: "clients",
            localField: "userId",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        { $match: { "client.selectedTrainerId": trainerId } },
        {
          $group: {
            _id: "$userId",
            clientName: {
              $first: {
                $concat: ["$client.firstName", " ", "$client.lastName"],
              },
            },
            profileImage: { $first: "$client.profileImage" },
            totalSessions: { $sum: 1 },
            completedSessions: { $sum: { $cond: ["$completed", 1, 0] } },
          },
        },
        {
          $project: {
            clientId: "$_id",
            clientName: 1,
            profileImage: 1,
            consistency: { $divide: ["$completedSessions", "$totalSessions"] },
            _id: 0,
          },
        },
        { $sort: { consistency: -1 } },
        { $limit: limit * 2 }, 
      ])
      .exec();

    return [
      ...result.slice(0, limit).map((item) => ({ ...item, type: "most" })),
      ...result
        .slice(-limit)
        .filter(
          (item) =>
            !result
              .slice(0, limit)
              .some(
                (topItem) =>
                  topItem.clientId.toString() === item.clientId.toString()
              )
        )
        .map((item) => ({ ...item, type: "least" })),
    ];
  }

  async getSessionHistory(
    trainerId: string,
    filters: { date?: string; clientId?: string; status?: string }
  ): Promise<ISessionHistory[]> {
    const match: any = {
      trainerId: new mongoose.Types.ObjectId(trainerId),
    };
    if (filters.date) match.date = filters.date;
    if (filters.clientId)
      match.clientId = new mongoose.Types.ObjectId(filters.clientId);
    if (filters.status) match.status = filters.status;

    const result = await this.sessionHistoryModel
      .aggregate([
        { $match: match },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            date: 1,
            startTime: 1,
            endTime: 1,
            status: 1,
            clientName: {
              $concat: ["$client.firstName", " ", "$client.lastName"],
            },
            clientId: "$client._id",
          },
        },
        { $sort: { date: -1 } },
      ])
      .exec();

    return result.map((item) => ({
      id: item._id.toString(),
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      clientName: item.clientName || "N/A",
      clientId: item.clientId?.toString(),
    }));
  }
}
