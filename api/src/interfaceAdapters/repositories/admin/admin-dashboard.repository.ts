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
import { PaymentModel } from "@/frameworks/database/mongoDB/models/payment.model";
import {
  CategoryModel,
  ICategoryModel,
} from "@/frameworks/database/mongoDB/models/category.model";
import {
  SlotModel,
  ISlotModel,
} from "@/frameworks/database/mongoDB/models/slot.model";
import {
  SessionHistoryModel,
  ISessionHistoryModel,
} from "@/frameworks/database/mongoDB/models/session-history.model";
import {
  WorkoutModel,
  IWorkoutModel,
} from "@/frameworks/database/mongoDB/models/workout.model";
import {
  WorkoutProgressModel,
  IWorkoutProgressModel,
} from "@/frameworks/database/mongoDB/models/workout-progress.model";
import { IAdminDashboardRepository } from "@/entities/repositoryInterfaces/admin/admin-dashboard-repository.interface";
import {
  IDashboardStats,
  IPopularWorkout,
  IRevenueReport,
  ISessionReport,
  ITopTrainer,
  IUserAndSessionData,
} from "@/entities/models/admin-dashboard.entity";

@injectable()
export class AdminDashboardRepository
  extends BaseRepository<typeof PaymentModel>
  implements IAdminDashboardRepository
{
  private clientModel: Model<IClientModel>;
  private trainerModel: Model<ITrainerModel>;
  private categoryModel: Model<ICategoryModel>;
  private slotModel: Model<ISlotModel>;
  private sessionHistoryModel: Model<ISessionHistoryModel>;
  private workoutModel: Model<IWorkoutModel>;
  private workoutProgressModel: Model<IWorkoutProgressModel>;

  constructor() {
    super(PaymentModel);
    this.clientModel = ClientModel;
    this.trainerModel = TrainerModel;
    this.categoryModel = CategoryModel;
    this.slotModel = SlotModel;
    this.sessionHistoryModel = SessionHistoryModel;
    this.workoutModel = WorkoutModel;
    this.workoutProgressModel = WorkoutProgressModel;
  }

  async getDashboardStats(year: number): Promise<IDashboardStats> {
    const [
      paymentResult,
      userCount,
      trainerCount,
      categoryCount,
      sessionCount,
    ] = await Promise.all([
      this.model
        .aggregate([
          { $match: { status: "completed" } },
          {
            $facet: {
              totalRevenue: [
                { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
              ],
              monthlyFinancials: [
                {
                  $match: {
                    createdAt: {
                      $gte: new Date(`${year}-01-01T00:00:00.000+05:30`),
                      $lte: new Date(`${year}-12-31T23:59:59.999+05:30`),
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {
                        format: "%Y-%m",
                        date: "$createdAt",
                        timezone: "Asia/Kolkata",
                      },
                    },
                    totalIncome: { $sum: "$amount" },
                    totalTrainerEarnings: { $sum: "$trainerAmount" },
                  },
                },
                {
                  $project: {
                    month: "$_id",
                    totalIncome: 1,
                    profit: {
                      $subtract: ["$totalIncome", "$totalTrainerEarnings"],
                    },
                    _id: 0,
                  },
                },
                { $sort: { month: 1 } },
              ],
            },
          },
        ])
        .exec(),
      this.clientModel.countDocuments({ role: "client" }),
      this.trainerModel.countDocuments({ approvalStatus: "approved" }),
      this.categoryModel.countDocuments({ status: true }),
      this.slotModel.countDocuments({ isBooked: true, status: "booked" }),
    ]);

    return {
      totalRevenue: paymentResult[0]?.totalRevenue[0]?.totalRevenue || 0,
      totalUsers: userCount,
      totalTrainers: trainerCount,
      totalCategories: categoryCount,
      activeSessions: sessionCount,
      monthlyFinancials: paymentResult[0]?.monthlyFinancials || [],
    };
  }

  async getTopPerformingTrainers(limit: number = 5): Promise<ITopTrainer[]> {
    const result = await this.trainerModel
      .aggregate([
        { $match: { approvalStatus: "approved" } },
        {
          $lookup: {
            from: "sessionhistories",
            localField: "_id",
            foreignField: "trainerId",
            as: "sessions",
          },
        },
        {
          $project: {
            name: { $concat: ["$firstName", " ", "$lastName"] },
            skills: 1,
            totalSessions: { $size: "$sessions" },
            totalClients: {
              $size: {
                $setUnion: {
                  $map: {
                    input: "$sessions",
                    as: "session",
                    in: "$$session.clientId",
                  },
                },
              },
            },
            _id: 1,
          },
        },
        { $sort: { totalClients: -1 } },
        { $limit: limit },
      ])
      .exec();

    return result.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      skills: item.skills || [],
      totalClients: item.totalClients,
      totalSessions: item.totalSessions,
    }));
  }

  async getPopularWorkouts(limit: number = 5): Promise<IPopularWorkout[]> {
    // Current date/time in IST timezone
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // Define start and end of current month
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Define start and end of last month
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0
    );
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const result = await this.workoutModel
      .aggregate([
        {
          $lookup: {
            from: "workoutprogresses",
            localField: "_id",
            foreignField: "workoutId",
            as: "progress",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            enrolledClients: { $size: { $setUnion: ["$progress.userId"] } },
            sessionsThisMonth: {
              $size: {
                $filter: {
                  input: "$progress",
                  as: "p",
                  cond: {
                    $and: [
                      { $gte: ["$$p.date", currentMonthStart] },
                      { $lte: ["$$p.date", currentMonthEnd] },
                      { $eq: ["$$p.completed", true] },
                    ],
                  },
                },
              },
            },
            sessionsLastMonth: {
              $size: {
                $filter: {
                  input: "$progress",
                  as: "p",
                  cond: {
                    $and: [
                      { $gte: ["$$p.date", lastMonthStart] },
                      { $lte: ["$$p.date", lastMonthEnd] },
                      { $eq: ["$$p.completed", true] },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            growthPercentage: {
              $cond: {
                if: { $eq: ["$sessionsLastMonth", 0] },
                then: 0,
                else: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            "$sessionsThisMonth",
                            "$sessionsLastMonth",
                          ],
                        },
                        "$sessionsLastMonth",
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            name: "$title",
            category: { $ifNull: ["$category.title", "Uncategorized"] },
            enrolledClients: 1,
            growthPercentage: 1,
          },
        },
        { $sort: { enrolledClients: -1 } },
        { $limit: limit },
      ])
      .exec();

    return result.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      enrolledClients: item.enrolledClients,
      growthPercentage: item.growthPercentage,
    }));
  }

  async getUserAndSessionData(
    year: number,
    type: "daily" | "weekly" = "daily"
  ): Promise<IUserAndSessionData> {
    const sessionFormat = type === "daily" ? "%Y-%m-%d" : "%Y-%U";
    const startOfYear = new Date(`${year}-01-01T00:00:00.000+05:30`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999+05:30`);

    const [signupResult, sessionResult] = await Promise.all([
      this.clientModel
        .aggregate([
          {
            $match: {
              role: "client",
              createdAt: { $gte: startOfYear, $lte: endOfYear },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$createdAt",
                  timezone: "Asia/Kolkata",
                },
              },
              totalSignups: { $sum: 1 },
            },
          },
          { $project: { month: "$_id", totalSignups: 1, _id: 0 } },
          { $sort: { month: 1 } },
        ])
        .exec(),
      this.sessionHistoryModel
        .aggregate([
          {
            $match: {
              status: "booked",
              createdAt: { $gte: startOfYear, $lte: endOfYear },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: sessionFormat,
                  date: "$createdAt",
                  timezone: "Asia/Kolkata",
                },
              },
              totalSessions: { $sum: 1 },
            },
          },
          { $project: { period: "$_id", totalSessions: 1, _id: 0 } },
          { $sort: { period: 1 } },
        ])
        .exec(),
    ]);

    return {
      monthlySignups: signupResult,
      sessionOverview: sessionResult,
    };
  }

  async getRevenueReport(year: number): Promise<IRevenueReport[]> {
    const result = await this.model
      .aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(`${year}-01-01T00:00:00.000+05:30`),
              $lte: new Date(`${year}-12-31T23:59:59.999+05:30`),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
            totalRevenue: { $sum: "$amount" },
            totalTrainerEarnings: { $sum: "$trainerAmount" },
            totalProfit: { $sum: { $subtract: ["$amount", "$trainerAmount"] } },
          },
        },
        {
          $project: {
            month: "$_id",
            totalRevenue: 1,
            totalTrainerEarnings: 1,
            totalProfit: 1,
            _id: 0,
          },
        },
        { $sort: { month: 1 } },
      ])
      .exec();
    return result;
  }

  async getSessionReport(year: number): Promise<ISessionReport[]> {
    const result = await this.sessionHistoryModel
      .aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(`${year}-01-01T00:00:00.000+05:30`),
              $lte: new Date(`${year}-12-31T23:59:59.999+05:30`),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
            totalSessions: { $sum: 1 },
            uniqueClients: { $addToSet: "$clientId" },
          },
        },
        {
          $project: {
            date: "$_id",
            totalSessions: 1,
            uniqueClientsCount: { $size: "$uniqueClients" },
            _id: 0,
          },
        },
        { $sort: { date: 1 } },
      ])
      .exec();
    return result;
  }
}
