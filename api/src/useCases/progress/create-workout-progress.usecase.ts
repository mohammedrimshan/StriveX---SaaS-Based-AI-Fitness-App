import { injectable, inject } from "tsyringe";
import { ICreateWorkoutProgressUseCase } from "@/entities/useCaseInterfaces/progress/create-workout-progress.usecase.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { WorkoutModel } from "@/frameworks/database/mongoDB/models/workout.model";
import { SocketService } from "@/interfaceAdapters/services/socket.service";

@injectable()
export class CreateWorkoutProgressUseCase implements ICreateWorkoutProgressUseCase {
  constructor(
    @inject("IWorkoutProgressRepository") private workoutProgressRepository: IWorkoutProgressRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("SocketService") private socketService: SocketService
  ) {}

  async execute(data: Partial<IWorkoutProgressEntity>): Promise<IWorkoutProgressEntity> {
    if (!data.id || !data.id) {
      throw new CustomError("Missing required fields: userId, workoutId", HTTP_STATUS.BAD_REQUEST);
    }

    const client = await this.clientRepository.findByClientId(data.id);
    if (!client) {
      throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
    }
console.log(client,"Client found successfully");

    let duration = data.duration;
    if (!duration || duration <= 0) {
      const workout = await WorkoutModel.findById(data.workoutId).lean();
      console.log(workout,"Workout found successfully")
      if (!workout || !workout.duration) {
        throw new CustomError("Workout or video duration not found", HTTP_STATUS.NOT_FOUND);
      }
      duration = workout.duration;
    }

    const progress = await this.workoutProgressRepository.createProgress({
      userId: data.userId,
      workoutId: data.workoutId,
      date: data.date || new Date(),
      duration,
      completed: data.completed || false,
    });

    if (progress.completed) {
      this.socketService.getIO().emit("workoutCompleted", {
        userId: progress.userId,
        workoutId: progress.workoutId,
        timestamp: new Date().toISOString(),
      });
    }

    return progress;
  }
}