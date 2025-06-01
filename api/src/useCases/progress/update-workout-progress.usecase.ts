
import { injectable, inject } from "tsyringe";
import { IUpdateWorkoutProgressUseCase } from "@/entities/useCaseInterfaces/progress/update-workout-progress.usecase.interface";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { SocketService } from "@/interfaceAdapters/services/socket.service";

@injectable()
export class UpdateWorkoutProgressUseCase implements IUpdateWorkoutProgressUseCase {
  constructor(
    @inject("IWorkoutProgressRepository") private workoutProgressRepository: IWorkoutProgressRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("SocketService") private socketService: SocketService
  ) {}

  async execute(id: string, updates: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity | null> {
    if (!id) {
      throw new CustomError("Progress ID is required", HTTP_STATUS.BAD_REQUEST);
    }
    if (updates.duration && updates.duration <= 0) {
      throw new CustomError("Duration must be positive", HTTP_STATUS.BAD_REQUEST);
    }

    if (updates.userId) {
      const client = await this.clientRepository.findByClientId(updates.userId.toString());
      if (!client) {
        throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
      }
    }

    const progress = await this.workoutProgressRepository.updateProgress(id, updates);

    if (!progress) {
      throw new CustomError("Progress not found", HTTP_STATUS.NOT_FOUND);
    }

    if (progress.completed && updates.completed) {
      this.socketService.getIO().emit("workoutCompleted", {
        userId: progress.userId,
        workoutId: progress.workoutId,
        timestamp: new Date().toISOString(),
      });
      console.log(`Workout completed for user ${progress.userId}, workout ${progress.workoutId}`);
    }

    return progress;
  }
}