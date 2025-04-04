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
  constructor(
    @inject("IWorkoutRepository") private workoutRepository: IWorkoutRepository,
    @inject("ICloudinaryService") private cloudinaryService: ICloudinaryService
  ) {}

  async execute(
    id: string,
    workoutData: Partial<IWorkoutEntity>,
    files?: { image?: string } // Removed music from files
  ): Promise<IWorkoutEntity> {
    const workout = await this.workoutRepository.findById(id);
    if (!workout) {
      throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
    }

    let imageUrl: string | undefined = workout.imageUrl;

    try {
      // Upload new image if provided
      if (files?.image) {
        const imageResult = await this.cloudinaryService.uploadImage(files.image, {
          folder: "workouts/images",
        });
        imageUrl = imageResult.secure_url;
      }

      const updatedData = {
        ...workoutData,
        imageUrl,
      };

      const updatedWorkout = await this.workoutRepository.update(id, updatedData);
      if (!updatedWorkout) {
        throw new CustomError("Failed to update workout", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
      return updatedWorkout;
    } catch (error) {
      throw new CustomError(
        error instanceof Error ? error.message : "Failed to update workout",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}