import { injectable, inject } from "tsyringe";
import { IUpdateVideoProgressUseCase } from "@/entities/useCaseInterfaces/progress/update-video-progress.usecase.interface";
import { IWorkoutVideoProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-video-progress-repository.interface";
import { IWorkoutVideoProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class UpdateVideoProgressUseCase implements IUpdateVideoProgressUseCase {
  constructor(
    @inject("IWorkoutVideoProgressRepository")
    private workoutVideoProgressRepository: IWorkoutVideoProgressRepository
  ) {}

  async execute(
    userId: string,
    workoutId: string,
    videoProgress: number,
    status: "Not Started" | "In Progress" | "Completed",
    completedExercises: string[],
    exerciseId: string
  ): Promise<IWorkoutVideoProgressEntity> {
    if (!userId || !workoutId || !exerciseId) {
      throw new CustomError(
        "User ID, Workout ID, and Exercise ID are required",
        HTTP_STATUS.BAD_REQUEST
      );
    }
    if (videoProgress < 0 || videoProgress > 100) {
      throw new CustomError(
        "Video progress must be between 0 and 100",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!["Not Started", "In Progress", "Completed"].includes(status)) {
      throw new CustomError("Invalid status", HTTP_STATUS.BAD_REQUEST);
    }

    const progress =
      await this.workoutVideoProgressRepository.updateVideoProgress(
        userId,
        workoutId,
        exerciseId,
        videoProgress,
        status,
        completedExercises
      );

    if (status === "Completed") {
      console.log(
        `Exercise ${exerciseId} completed for user ${userId}, workout ${workoutId}`
      );
    }

    return progress;
  }
}
