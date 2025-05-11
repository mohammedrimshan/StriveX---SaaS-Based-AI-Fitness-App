import { injectable, inject } from "tsyringe";
import { WorkoutProgressModel } from "@/frameworks/database/mongoDB/models/workout-progress.model";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { BaseRepository } from "../base.repository";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { PipelineStage, Types } from "mongoose";

@injectable()
export class WorkoutProgressRepository extends BaseRepository<IWorkoutProgressEntity> implements IWorkoutProgressRepository {
  constructor() {
    super(WorkoutProgressModel);
  }

  async createProgress(data: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity> {
    const entity = await this.model.create(data);
    return this.mapToEntity(entity.toObject());
  }

  async updateProgress(id: string, updates: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity | null> {
    const progress = await this.model
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean();
    return progress ? this.mapToEntity(progress) : null;
  }

  async findByUserAndWorkout(userId: string, workoutId: string): Promise<IWorkoutProgressEntity | null> {
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
  }> {
    const fullPipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "workoutprogresses",
          localField: "_id",
          foreignField: "userId",
          as: "workoutProgress",
          pipeline: [
            {
              $match: {
                ...(startDate && { date: { $gte: startDate } }),
                ...(endDate && { date: { $lte: endDate } }),
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "workoutvideoprogresses",
          localField: "workoutProgress.workoutId",
          foreignField: "workoutId",
          as: "videoProgress",
          pipeline: [
            { $match: { userId } },
            {
              $project: {
                exerciseProgress: 1,
                completedExercises: 1,
                workoutId: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "workouts",
          localField: "workoutProgress.workoutId",
          foreignField: "_id",
          as: "workouts",
        },
      },
      {
        $project: {
          client: "$$ROOT",
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
                completed: {
                  $let: {
                    vars: {
                      videoProgress: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$videoProgress",
                              as: "vp",
                              cond: { $eq: ["$$vp.workoutId", "$$progress.workoutId"] },
                            },
                          },
                          0,
                        ],
                      },
                      workout: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$workouts",
                              as: "w",
                              cond: { $eq: ["$$w._id", "$$progress.workoutId"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      $cond: {
                        if: {
                          $and: [
                            { $ne: ["$$videoProgress", null] },
                            {
                              $eq: [
                                { $size: "$$videoProgress.completedExercises" },
                                { $size: "$$workout.exercises" },
                              ],
                            },
                          ],
                        },
                        then: true,
                        else: false,
                      },
                    },
                  },
                },
                createdAt: "$$progress.createdAt",
                updatedAt: "$$progress.updatedAt",
              },
            },
          },
          workouts: 1,
          videoProgress: 1,
        },
      },
      {
        $project: {
          client: 1,
          workoutProgress: {
            $cond: [
              { $isArray: "$workoutProgress" },
              "$workoutProgress",
              [],
            ],
          },
          bmi: {
            $cond: {
              if: {
                $and: [
                  { $gt: ["$client.weight", 0] },
                  { $gt: ["$client.height", 0] },
                ],
              },
              then: {
                $divide: [
                  "$client.weight",
                  {
                    $pow: [
                      { $divide: ["$client.height", 100] },
                      2,
                    ],
                  },
                ],
              },
              else: null,
            },
          },
          weightHistory: {
            $cond: {
              if: { $gt: ["$client.weight", 0] },
              then: [
                {
                  weight: "$client.weight",
                  date: "$client.updatedAt",
                },
              ],
              else: [],
            },
          },
          heightHistory: {
            $cond: {
              if: { $gt: ["$client.height", 0] },
              then: [
                {
                  height: "$client.height",
                  date: "$client.updatedAt",
                },
              ],
              else: [],
            },
          },
          waterIntakeLogs: {
            $cond: {
              if: { $gte: ["$client.waterIntake", 0] },
              then: [
                {
                  actual: "$client.waterIntake",
                  target: 2000,
                  date: "$client.updatedAt",
                },
              ],
              else: [],
            },
          },
        },
      },
    ];

    const fullResult = await this.model.db.collection("clients").aggregate(fullPipeline).toArray();

    if (!fullResult.length) {
      throw new CustomError("No client found for user", HTTP_STATUS.NOT_FOUND);
    }

    const { workoutProgress, bmi, weightHistory, heightHistory, waterIntakeLogs } = fullResult[0];

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