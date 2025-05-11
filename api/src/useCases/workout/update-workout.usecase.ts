import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IUpdateWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/update-workout-usecase.interface";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS,ERROR_MESSAGES } from "@/shared/constants";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";

@injectable()
export class UpdateWorkoutUseCase implements IUpdateWorkoutUseCase {

  private _workoutRepository: IWorkoutRepository;
  private _cloudinaryService: ICloudinaryService;

  constructor(
    @inject("IWorkoutRepository") workoutRepository: IWorkoutRepository,
    @inject("ICloudinaryService") cloudinaryService: ICloudinaryService
  ) {
    this._workoutRepository = workoutRepository;
    this._cloudinaryService = cloudinaryService;
  }

  async execute(
    id: string,
    workoutData: Partial<IWorkoutEntity>,
    files?: { image?: string }
  ): Promise<IWorkoutEntity> {
    const workout = await this._workoutRepository.findById(id);
    if (!workout) {
      throw new CustomError(ERROR_MESSAGES.WORKOUT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    let imageUrl: string | undefined = workout.imageUrl;

    try {
      if (files?.image) {
        const imageResult = await this._cloudinaryService.uploadImage(files.image, {
          folder: "workouts/images",
        });
        imageUrl = imageResult.secure_url;
      } else if (workoutData.imageUrl !== undefined) {
        imageUrl = workoutData.imageUrl;
      }

      const updatedData = {
        ...workoutData,
        imageUrl,
      };

      const updatedWorkout = await this._workoutRepository.update(id, updatedData);

      if (!updatedWorkout) {
        throw new CustomError(ERROR_MESSAGES.WORKOUT_UPDATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      return updatedWorkout;
    } catch (error) {
      throw new CustomError(
        error instanceof Error ? error.message : ERROR_MESSAGES.WORKOUT_UPDATE_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
