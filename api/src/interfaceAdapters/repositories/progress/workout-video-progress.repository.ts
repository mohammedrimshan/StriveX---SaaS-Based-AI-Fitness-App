import { injectable } from "tsyringe";
import { IWorkoutVideoProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-video-progress-repository.interface";
import { WorkoutVideoProgressModel } from "@/frameworks/database/mongoDB/models/workout-video-progress.model";
import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";
import { BaseRepository } from "../base.repository";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class WorkoutVideoProgressRepository extends BaseRepository<IWorkoutVideoProgressEntity> implements IWorkoutVideoProgressRepository {
  constructor() {
    super(WorkoutVideoProgressModel);
  }

  async findByUserAndWorkout(userId: string, workoutId: string): Promise<IWorkoutVideoProgressEntity | null> {
    const progress = await this.model.findOne({ userId, workoutId }).lean();
    return progress ? this.mapToEntity(progress) : null;
  }

  async findUserVideoProgress(
    userId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IWorkoutVideoProgressEntity[] | []; total: number }> {
    const filter = { userId };

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate("workoutId", "title")
        .sort({ lastUpdated: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    const transformedItems = items.map((item) => this.mapToEntity(item));
    return { items: transformedItems, total };
  }

  async updateVideoProgress(
    userId: string,
    workoutId: string,
    exerciseId: string,
    videoProgress: number,
    status: "Not Started" | "In Progress" | "Completed",
    completedExercises: string[]
  ): Promise<IWorkoutVideoProgressEntity> {
    const filter = { userId, workoutId };
    const exerciseProgressUpdate = {
      exerciseId,
      videoProgress,
      status,
      lastUpdated: new Date(),
    };

    let progress = await this.model.findOneAndUpdate(
      {
        ...filter,
        "exerciseProgress.exerciseId": exerciseId,
      },
      {
        $set: {
          lastUpdated: new Date(),
          completedExercises,
          "exerciseProgress.$": exerciseProgressUpdate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("workoutId", "title").lean();

    if (!progress) {
      progress = await this.model.findOneAndUpdate(
        filter,
        {
          $push: { exerciseProgress: exerciseProgressUpdate },
          $set: {
            lastUpdated: new Date(),
            completedExercises,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).populate("workoutId", "title").lean();
    }

    if (!progress) {
      throw new CustomError("Failed to update video progress", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return this.mapToEntity(progress);
  }

  protected mapToEntity(doc: any): IWorkoutVideoProgressEntity {
    const { _id, __v, workoutId, ...rest } = doc;
    return {
      ...rest,
      id: _id?.toString(),
      workoutId: workoutId?._id?.toString() || workoutId,
    } as IWorkoutVideoProgressEntity;
  }
}
