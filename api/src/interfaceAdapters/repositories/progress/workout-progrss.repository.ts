import { injectable } from "tsyringe";
import { WorkoutProgressModel } from "@/frameworks/database/mongoDB/models/workout-progress.model";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import {
  IWorkoutProgressEntity,
  IWorkoutVideoProgressEntity,
} from "@/entities/models/workout.progress.entity";
import { BaseRepository } from "../base.repository";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { PipelineStage, Types } from "mongoose";
import { IWorkoutEntity } from "@/entities/models/workout.entity";

@injectable()
export class WorkoutProgressRepository
  extends BaseRepository<IWorkoutProgressEntity>
  implements IWorkoutProgressRepository
{
  constructor() {
    super(WorkoutProgressModel);
  }

  async createProgress(
    data: Partial<IWorkoutProgressEntity>
  ): Promise<IWorkoutProgressEntity> {
    const entity = await this.model.create(data);
    return this.mapToEntity(entity.toObject());
  }

  async updateProgress(
    id: string,
    updates: Partial<IWorkoutProgressEntity>
  ): Promise<IWorkoutProgressEntity | null> {
    const progress = await this.model
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean();
    return progress ? this.mapToEntity(progress) : null;
  }

  async findByUserAndWorkout(
    userId: string,
    workoutId: string
  ): Promise<IWorkoutProgressEntity | null> {
    const progress = await this.model.findOne({ userId, workoutId }).lean();
    return progress ? this.mapToEntity(progress) : null;
  }

  async findUserProgress(
    userId: string,
    skip: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ items: IWorkoutProgressEntity[]; total: number }> {
    const filter: any = { userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);

    const transformedItems = items.map((item) => this.mapToEntity(item));
    return { items: transformedItems, total };
  }

  async getUserProgressMetrics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    workoutProgress: IWorkoutProgressEntity[];
    bmi: number | null;
    weightHistory: { weight: number; date: Date }[];
    heightHistory: { height: number; date: Date }[];
    waterIntakeLogs: { actual: number; target: number; date: Date }[];
    totalWaterIntake: number;
    videoProgress: IWorkoutVideoProgressEntity[];
    workouts: IWorkoutEntity[];
    subscriptionEndDate: Date;
  }> {
    const now = new Date();
    const fullPipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(userId),
        },
      },
      {
        $project: {
          _id: 1,
          weight: 1,
          height: 1,
          subscriptionEndDate: 1,
        },
      },
      {
        $lookup: {
          from: "workoutprogresses",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$userId"] },
                ...(startDate && { date: { $gte: startDate } }),
                ...(endDate && { date: { $lte: endDate } }),
              },
            },
            {
              $sort: { date: -1 },
            },
          ],
          as: "workoutProgress",
        },
      },
      {
        $lookup: {
          from: "clientprogresshistories",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$userId"] },
                ...(startDate && { date: { $gte: startDate } }),
                ...(endDate && { date: { $lte: endDate } }),
              },
            },
            {
              $sort: { date: -1 },
            },
          ],
          as: "progressHistory",
        },
      },
      {
        $lookup: {
          from: "workoutvideoprogresses",
          let: { userId: "$_id", workoutIds: "$workoutProgress.workoutId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $in: ["$workoutId", "$$workoutIds"] },
                  ],
                },
              },
            },
            {
              $project: {
                userId: 1,
                workoutId: 1,
                exerciseProgress: 1,
                completedExercises: 1,
                lastUpdated: 1,
              },
            },
          ],
          as: "videoProgress",
        },
      },
      {
        $lookup: {
          from: "workouts",
          let: { workoutIds: "$workoutProgress.workoutId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$workoutIds"] },
              },
            },
            {
              $project: {
                title: 1,
                exercises: 1,
              },
            },
          ],
          as: "workouts",
        },
      },
      {
        $addFields: {
          bmi: {
            $cond: {
              if: {
                $and: [{ $gt: ["$weight", 0] }, { $gt: ["$height", 0] }],
              },
              then: {
                $divide: [
                  "$weight",
                  {
                    $pow: [{ $divide: ["$height", 100] }, 2],
                  },
                ],
              },
              else: null,
            },
          },
          weightHistory: {
            $filter: {
              input: "$progressHistory",
              as: "item",
              cond: { $ne: ["$$item.weight", null] },
            },
          },
          heightHistory: {
            $filter: {
              input: "$progressHistory",
              as: "item",
              cond: { $ne: ["$$item.height", null] },
            },
          },
          waterIntakeLogs: {
            $filter: {
              input: "$progressHistory",
              as: "item",
              cond: { $ne: ["$$item.waterIntake", null] },
            },
          },
          totalWaterIntake: {
            $sum: "$progressHistory.waterIntake",
          },
          remainingSubscriptionMs: {
            $cond: {
              if: { $gt: ["$subscriptionEndDate", now] },
              then: { $subtract: ["$subscriptionEndDate", now] },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          workoutProgress: {
            $map: {
              input: "$workoutProgress",
              as: "progress",
              in: {
                id: "$$progress._id",
                userId: "$$progress.userId",
                workoutId: "$$progress.workoutId",
                date: "$$progress.date",
                duration: "$$progress.duration",
                caloriesBurned: "$$progress.caloriesBurned",
                completed: "$$progress.completed",
                createdAt: "$$progress.createdAt",
                updatedAt: "$$progress.updatedAt",
              },
            },
          },
          bmi: 1,
          weightHistory: {
            $map: {
              input: "$weightHistory",
              as: "item",
              in: {
                weight: "$$item.weight",
                date: "$$item.date",
              },
            },
          },
          heightHistory: {
            $map: {
              input: "$heightHistory",
              as: "item",
              in: {
                height: "$$item.height",
                date: "$$item.date",
              },
            },
          },
          waterIntakeLogs: {
            $map: {
              input: "$waterIntakeLogs",
              as: "item",
              in: {
                actual: "$$item.waterIntake",
                target: "$$item.waterIntakeTarget",
                date: "$$item.date",
              },
            },
          },
          totalWaterIntake: 1,
          videoProgress: {
            $map: {
              input: "$videoProgress",
              as: "vp",
              in: {
                id: "$$vp._id",
                userId: "$$vp.userId",
                workoutId: "$$vp.workoutId",
                exerciseProgress: "$$vp.exerciseProgress",
                completedExercises: "$$vp.completedExercises",
                lastUpdated: "$$vp.lastUpdated",
              },
            },
          },
          workouts: {
            $map: {
              input: "$workouts",
              as: "w",
              in: {
                id: "$$w._id",
                title: "$$w.title",
                exercises: "$$w.exercises",
              },
            },
          },
          subscriptionEndDate: 1,
          remainingSubscriptionMs: 1,
        },
      },
    ];

    const fullResult = await this.model.db
      .collection("clients")
      .aggregate(fullPipeline)
      .toArray();
    if (!fullResult.length) {
      throw new CustomError("No client found for user", HTTP_STATUS.NOT_FOUND);
    }

    const {
      workoutProgress,
      bmi,
      weightHistory,
      heightHistory,
      waterIntakeLogs,
      totalWaterIntake,
      videoProgress,
      workouts,
    } = fullResult[0];

    return {
      workoutProgress: workoutProgress.map((item: any) => ({
        ...item,
        id: item.id.toString(),
        workoutId: item.workoutId.toString(),
      })),
      bmi,
      weightHistory,
      heightHistory,
      waterIntakeLogs,
      totalWaterIntake,
      subscriptionEndDate: fullResult[0].subscriptionEndDate,
      videoProgress: videoProgress.map((item: any) => ({
        ...item,
        id: item.id.toString(),
        userId: item.userId.toString(),
        workoutId: item.workoutId.toString(),
      })),
      workouts: workouts.map((item: any) => ({
        ...item,
        id: item.id.toString(),
      })),
      
    };
  }

  protected mapToEntity(doc: any): IWorkoutProgressEntity {
    const { _id, __v, workoutId, ...rest } = doc;
    return {
      ...rest,
      id: _id?.toString(),
      workoutId: workoutId?._id?.toString() || workoutId,
    } as IWorkoutProgressEntity;
  }
}
