// api\src\useCases\workout\add-workout.usecase.ts
import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IAddWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/add-workout-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";

@injectable()
export class AddWorkoutUseCase implements IAddWorkoutUseCase {
  constructor(
    @inject("IWorkoutRepository") private _workoutRepository: IWorkoutRepository,
    @inject("ICloudinaryService") private _cloudinaryService: ICloudinaryService
  ) {}

  async execute(
    workoutData: IWorkoutEntity,
    files: { image?: string; videos?: string[] }
  ): Promise<IWorkoutEntity> {
    let imageUrl: string | undefined = workoutData.imageUrl;

    try {
      if (files?.image) {
        const imageResult = await this._cloudinaryService.uploadImage(
          files.image,
          {
            folder: "workouts/images",
          }
        );
        imageUrl = imageResult.secure_url;
      }

      if (files?.videos && files.videos.length > 0) {
        const videoUploads = files.videos.map((video) =>
          this._cloudinaryService.uploadFile(video, {
            folder: "exercises/videos",
          })
        );
        const videoResults = await Promise.all(videoUploads);

        workoutData.exercises = workoutData.exercises.map(
          (exercise, index) => ({
            ...exercise,
            videoUrl: videoResults[index]?.secure_url || exercise.videoUrl,
          })
        );
      }

      const workoutWithFiles = {
        ...workoutData,
        imageUrl,
      };

      const createdWorkout = await this._workoutRepository.save(
        workoutWithFiles
      );
      return createdWorkout;
    } catch (error) {
      throw new CustomError(
        error instanceof Error ? error.message : "Failed to create workout",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
