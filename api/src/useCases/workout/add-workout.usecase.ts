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
    @inject("IWorkoutRepository") private workoutRepository: IWorkoutRepository,
    @inject("ICloudinaryService") private cloudinaryService: ICloudinaryService
  ) {}

  async execute(
    workoutData: IWorkoutEntity,
    files: { image?: string }
  ): Promise<IWorkoutEntity> {
    let imageUrl: string | undefined;

    try {
      if (files?.image) {
        const imageResult = await this.cloudinaryService.uploadImage(files.image, {
          folder: "workouts/images",
        });
        imageUrl = imageResult.secure_url;
      }

      const workoutWithFiles = {
        ...workoutData,
        imageUrl,
      };

      const createdWorkout = await this.workoutRepository.create(workoutWithFiles);
      return createdWorkout;
    } catch (error) {
      throw new CustomError(
        error instanceof Error ? error.message : "Failed to create workout",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}