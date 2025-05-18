// D:\StriveX\api\src\interfaceAdapters\repositories\progress\workout-video-progress.repository.ts
import { injectable } from "tsyringe";
import { IWorkoutVideoProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-video-progress-repository.interface";
import { WorkoutVideoProgressModel } from "@/frameworks/database/mongoDB/models/workout-video-progress.model";
import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";
import { BaseRepository } from "../base.repository";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { Types } from "mongoose";

@injectable()
export class WorkoutVideoProgressRepository
  extends BaseRepository<IWorkoutVideoProgressEntity>
  implements IWorkoutVideoProgressRepository
{
  constructor() {
    super(WorkoutVideoProgressModel);
  }

  async findByUserAndWorkout(
    userId: string,
    workoutId: string
  ): Promise<IWorkoutVideoProgressEntity | null> {
    const progress = await this.model.findOne({ userId, workoutId }).lean();
    return progress ? this.mapToEntity(progress) : null;
  }

  async findUserVideoProgress(userId: string, skip = 0, limit = 10) {
    const [data] = await this.model.aggregate([
      { $match: { userId } },
      {
        $facet: {
          items: [
            { $sort: { lastUpdated: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "workouts",
                localField: "workoutId",
                foreignField: "_id",
                as: "workoutData",
              },
            },
            { $unwind: "$workoutData" },
            {
              $addFields: {
                exerciseProgress: {
                  $map: {
                    input: "$exerciseProgress",
                    as: "progress",
                    in: {
                      $mergeObjects: [
                        "$$progress",
                        {
                          exerciseDetails: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$workoutData.exercises",
                                  as: "exercise",
                                  cond: {
                                    $eq: [
                                      "$$exercise._id",
                                      "$$progress.exerciseId",
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
            {
              $project: {
                workoutData: 0,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const total = data?.total?.[0]?.count || 0;
    return { items: data?.items || [], total };
  }

  async updateVideoProgress(
    userId: string,
    workoutId: string,
    exerciseId: string,
    videoProgress: number,
    status: "Not Started" | "In Progress" | "Completed",
    completedExercises: string[],
    clientTimestamp: string = new Date().toISOString()
  ): Promise<IWorkoutVideoProgressEntity> {
    if (!Types.ObjectId.isValid(exerciseId)) {
      throw new CustomError("Invalid exerciseId format", HTTP_STATUS.BAD_REQUEST);
    }

    const exerciseObjectId = new Types.ObjectId(exerciseId);

    const validCompletedExercises = completedExercises
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (status === "Completed" && !validCompletedExercises.some((id) => id.equals(exerciseObjectId))) {
      validCompletedExercises.push(exerciseObjectId);
    }

    const filter = { userId, workoutId };
    const exerciseProgressUpdate = {
      exerciseId: exerciseObjectId,
      videoProgress,
      status,
      lastUpdated: new Date(),
      clientTimestamp,
    };

    const currentProgress = await this.model
      .findOne({
        ...filter,
        "exerciseProgress.exerciseId": exerciseObjectId,
      })
      .lean();

    if (
      !Array.isArray(currentProgress) &&
      currentProgress?.exerciseProgress?.some((ep: any) =>
        ep.exerciseId.equals(exerciseObjectId) &&
        ep.status === "Completed" &&
        status !== "Completed"
      )
    ) {
      return this.mapToEntity(currentProgress);
    }

    let progress = await this.model
      .findOneAndUpdate(
        {
          ...filter,
          "exerciseProgress.exerciseId": exerciseObjectId,
          $or: [
            { "exerciseProgress.status": { $ne: "Completed" } },
            { "exerciseProgress.clientTimestamp": { $lt: clientTimestamp } },
          ],
        },
        {
          $set: {
            lastUpdated: new Date(),
            completedExercises: validCompletedExercises,
            "exerciseProgress.$": exerciseProgressUpdate,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .populate("workoutId", "title")
      .lean();

    if (!progress) {
      progress = await this.model
        .findOneAndUpdate(
          filter,
          {
            $push: { exerciseProgress: exerciseProgressUpdate },
            $set: {
              lastUpdated: new Date(),
              completedExercises: validCompletedExercises,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        )
        .populate("workoutId", "title")
        .lean();
    }

    if (!progress) {
      throw new CustomError("Failed to update video progress", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return this.mapToEntity(progress);
  }

  protected mapToEntity(doc: any): IWorkoutVideoProgressEntity {
    const { _id, __v, workoutId, completedExercises, ...rest } = doc;
    return {
      ...rest,
      id: _id?.toString(),
      workoutId: workoutId?._id?.toString() || workoutId,
      completedExercises: completedExercises.map((id: any) => id.toString()),
    } as IWorkoutVideoProgressEntity;
  }
}
