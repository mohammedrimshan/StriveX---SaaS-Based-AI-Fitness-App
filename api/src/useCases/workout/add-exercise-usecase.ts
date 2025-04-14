import { inject, injectable } from "tsyringe";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { IAddExerciseUseCase } from "@/entities/useCaseInterfaces/workout/add-exercise-usecase.interface";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { IExerciseEntity } from "@/entities/models/workout.entity";
import { IWorkoutEntity } from "@/entities/models/workout.entity";

@injectable()
export class AddExerciseUseCase implements IAddExerciseUseCase {
  constructor(
    @inject("IWorkoutRepository") private _workoutRepository: IWorkoutRepository,
    @inject("ICloudinaryService") private _cloudinaryService: ICloudinaryService
  ) {}

  async execute(
    workoutId: string,
    exerciseData: IExerciseEntity,
    files?: { video?: string }
  ): Promise<IWorkoutEntity> {
    try {
      const workout = await this._workoutRepository.findById(workoutId);
      if (!workout) {
        throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
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

      if (!videoUrl) {
        throw new CustomError("Video URL is required", HTTP_STATUS.BAD_REQUEST);
      }


      const newExercise: IExerciseEntity = {
        name: exerciseData.name,
        description: exerciseData.description,
        duration: exerciseData.duration,
        defaultRestDuration: exerciseData.defaultRestDuration,
        videoUrl,
      };

      workout.exercises.push(newExercise);

  
      const updatedWorkout = await this._workoutRepository.update(workoutId, {
        exercises: workout.exercises,
      });

      if (!updatedWorkout) {
        throw new CustomError("Failed to update workout", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      return updatedWorkout;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        "Failed to add exercise",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
}