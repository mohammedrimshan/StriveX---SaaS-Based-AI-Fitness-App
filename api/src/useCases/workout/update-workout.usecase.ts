// api\src\useCases\workout\update-workout.usecase.ts
import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IUpdateWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/update-workout-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";

@injectable()
export class UpdateWorkoutUseCase implements IUpdateWorkoutUseCase {

  private _workoutRepository : IWorkoutRepository
  private _cloudinaryService : ICloudinaryService

  constructor(
    @inject("IWorkoutRepository")  workoutRepository: IWorkoutRepository,
    @inject("ICloudinaryService")  cloudinaryService: ICloudinaryService
  ) {
    this._workoutRepository = workoutRepository
    this._cloudinaryService = cloudinaryService
  }

  async execute(
    id: string,
    workoutData: Partial<IWorkoutEntity>,
    files?: { image?: string }
  ): Promise<IWorkoutEntity> {
    const workout = await this._workoutRepository.findById(id);
    if (!workout) {
      throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
    }
    let imageUrl: string | undefined = workout.imageUrl;
    try {
      console.log("Workout data:", workoutData);
      console.log("Files:", files);
      if (files?.image) {
        const imageResult = await this._cloudinaryService.uploadImage(files.image, {
          folder: "workouts/images",
        });
        imageUrl = imageResult.secure_url;
        console.log("Uploaded new image:", imageUrl);
      } else if (workoutData.imageUrl !== undefined) {
        imageUrl = workoutData.imageUrl;
        console.log("Using provided imageUrl:", imageUrl);
      }
      const updatedData = {
        ...workoutData,
        imageUrl,
      };
      console.log("Updating with data:", updatedData);
      const updatedWorkout = await this._workoutRepository.update(id, updatedData);
      if (!updatedWorkout) {
        throw new CustomError("Failed to update workout", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
      console.log("Updated workout:", updatedWorkout);
      return updatedWorkout;
    } catch (error) {
      console.error("Update error:", error);
      throw new CustomError(
        error instanceof Error ? error.message : "Failed to update workout",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}