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

      let updatedExercises = [...workoutData.exercises];
      if (files?.videos && Array.isArray(files.videos) && files.videos.length > 0) {
        if (files.videos.length !== workoutData.exercises.length) {
          throw new CustomError(
            "Number of uploaded videos must match number of exercises",
            HTTP_STATUS.BAD_REQUEST
          );
        }

        const videoUploads = files.videos.map((video, index) =>
          this._cloudinaryService.uploadFile(video, {
            folder: "exercises/videos",
          }).catch((err) => {
            throw new CustomError(
              `Failed to upload video for exercise ${index}: ${err.message}`,
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
          })
        );

        const videoResults = await Promise.all(videoUploads);

        updatedExercises = workoutData.exercises.map((exercise, index) => {
          const videoUrl = videoResults[index]?.secure_url;
          if (!videoUrl) {
            throw new CustomError(
              `No video URL generated for exercise ${index}`,
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
          }
          return {
            ...exercise,
            videoUrl,
          };
        });
      } else {
      
        updatedExercises = workoutData.exercises.map((exercise, index) => {
          if (!exercise.videoUrl || exercise.videoUrl.trim() === "") {
            throw new CustomError(
              `Exercise at index ${index} is missing a required video URL`,
              HTTP_STATUS.BAD_REQUEST
            );
          }
          return exercise;
        });
      }

      const workoutWithFiles = {
        ...workoutData,
        imageUrl,
        exercises: updatedExercises,
      };

      const createdWorkout = await this._workoutRepository.save(workoutWithFiles);
      return createdWorkout;
    } catch (error) {
      throw new CustomError(
        error instanceof Error ? error.message : "Failed to create workout",
        error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}