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
export class CreateWorkoutProgressUseCase
  implements ICreateWorkoutProgressUseCase
{
  constructor(
    @inject("IWorkoutProgressRepository")
    private workoutProgressRepository: IWorkoutProgressRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("SocketService") private socketService: SocketService
  ) {}

  async execute(
    data: Partial<IWorkoutProgressEntity>
  ): Promise<IWorkoutProgressEntity> {
    if (!data.userId || !data.workoutId) {
      throw new CustomError(
        "Missing required fields: userId, workoutId",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const client = await this.clientRepository.findById(data.userId);
    if (!client) {
      throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    const workout = await WorkoutModel.findById(data.workoutId)
      .populate("category")
      .lean();
    if (!workout) {
      throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
    }
    let duration = data.duration;
    let caloriesBurned = data.caloriesBurned;
    const intensityMap = {
      Beginner: 0.8,
      Intermediate: 1.0,
      Advanced: 1.2,
    };

    if (!duration || duration <= 0 || !caloriesBurned) {
      duration =
        duration || (workout.duration ? Math.round(workout.duration / 60) : 30);
      if (!caloriesBurned && client.weight && workout.category) {
        const category = workout.category as any;
        if (!category || !category.metValue) {
          throw new CustomError(
            "Category or MET value not found",
            HTTP_STATUS.NOT_FOUND
          );
        }
        const intensity =
          intensityMap[workout.difficulty as keyof typeof intensityMap] || 1;
        caloriesBurned = Math.round(
          category.metValue * client.weight * (duration / 60) * intensity
        );
      } else if (!caloriesBurned) {
        caloriesBurned = 0;
      }
    }

    const progress = await this.workoutProgressRepository.createProgress({
      userId: data.userId,
      workoutId: data.workoutId,
      categoryId: workout.category._id.toString(),
      date: data.date || new Date(),
      duration,
      caloriesBurned,
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
