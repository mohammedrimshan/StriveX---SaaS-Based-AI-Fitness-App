import { inject, injectable } from "tsyringe";
import { IUpdateExerciseUseCase } from "@/entities/useCaseInterfaces/workout/update-exercise-usecase.interface";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { IExerciseEntity } from "@/entities/models/workout.entity";
import { IWorkoutEntity } from "@/entities/models/workout.entity";

@injectable()
export class UpdateExerciseUseCase implements IUpdateExerciseUseCase {
  constructor(
    @inject("IWorkoutRepository") private _workoutRepository: IWorkoutRepository,
    @inject("ICloudinaryService") private _cloudinaryService: ICloudinaryService
  ) {}

  async execute(
    workoutId: string,
    exerciseId: string,
    exerciseData: Partial<IExerciseEntity>,
    files?: { video?: string }
  ): Promise<IWorkoutEntity> {
    try {
      const workout = await this._workoutRepository.findById(workoutId);
      if (!workout) {
        throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
      }

      const exerciseExists = workout.exercises.some((ex) => ex._id?.toString() === exerciseId);
      if (!exerciseExists) {
        throw new CustomError("Exercise not found", HTTP_STATUS.NOT_FOUND);
      }

      let videoUrl = exerciseData.videoUrl;
      if (files?.video) {
        try {
          const uploadResult = await this._cloudinaryService.uploadFile(files.video, {
            folder: "workouts/videos",
            resource_type: "video",
          });
          videoUrl = uploadResult.secure_url;
        } catch (error) {
          throw new CustomError("Failed to upload video", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
      }

      const updateData: Partial<IExerciseEntity> = {
        ...exerciseData,
        ...(videoUrl && { videoUrl }), 
      };


      const updatedWorkout = await this._workoutRepository.updateExercises(
        workoutId,
        exerciseId,
        updateData
      )

      if (!updatedWorkout) {
        throw new CustomError(
          "Failed to update exercise",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }

      return updatedWorkout;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        "Failed to update exercise",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
}