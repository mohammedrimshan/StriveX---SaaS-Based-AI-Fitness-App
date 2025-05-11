import { injectable, inject } from "tsyringe";
import { IUpdateWorkoutProgressUseCase } from "@/entities/useCaseInterfaces/progress/update-workout-progress.usecase.interface";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class UpdateWorkoutProgressUseCase implements IUpdateWorkoutProgressUseCase {
  constructor(
    @inject("IWorkoutProgressRepository") private workoutProgressRepository: IWorkoutProgressRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  async execute(id: string, updates: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity | null> {
    // Validate inputs
    if (!id) {
      throw new CustomError("Progress ID is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (updates.duration && updates.duration <= 0) {
      throw new CustomError("Duration must be positive", HTTP_STATUS.BAD_REQUEST);
    }

    // Check if user exists if userId is updated
    if (updates.userId) {
      const client = await this.clientRepository.findByClientId(updates.userId);
      if (!client) {
        throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
      }
    }

    // Update progress
    const progress = await this.workoutProgressRepository.updateProgress(id, updates);

    if (!progress) {
      throw new CustomError("Progress not found", HTTP_STATUS.NOT_FOUND);
    }

    // Emit Socket.IO event if completed
    if (progress.completed && updates.completed) {
      // TODO: Inject Socket.IO service and emit event
      console.log(`Workout completed for user ${progress.userId}, workout ${progress.workoutId}`);
    }

    return progress;
  }
}