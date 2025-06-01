import { injectable, inject } from "tsyringe";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { IGetUserProgressMetricsUseCase } from "@/entities/useCaseInterfaces/progress/get-user-progress-metrics.usecase.interface";
import { IWorkoutProgressEntity } from "@/entities/models/workout.progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { Types } from "mongoose";

@injectable()
export class GetUserProgressMetricsUseCase
  implements IGetUserProgressMetricsUseCase
{
  constructor(
    @inject("IWorkoutProgressRepository")
    private workoutProgressRepository: IWorkoutProgressRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  async execute(
    userId: string, // Expecting Client._id
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    workoutProgress: IWorkoutProgressEntity[];
    bmi: number | null;
    weightHistory: { weight: number; date: Date }[];
    heightHistory: { height: number; date: Date }[];
    waterIntakeLogs: { actual: number; target: number; date: Date }[];
  }> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      console.log(userId, "User ID is invalid or missing");
      throw new CustomError(
        "User ID is required and must be a valid ObjectId",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Fetch Client to get clientId
    const client = await this.clientRepository.findByClientNewId(userId);
    if (!client || !client.id) {
      console.log(
        userId,
        "Client not found for userId or client ID is missing"
      );
      throw new CustomError(
        "No client found for user or client ID is missing",
        HTTP_STATUS.NOT_FOUND
      );
    }

    console.log(
      startDate,
      endDate,
      `Fetching progress metrics for clientId: ${client.id}`
    );
    return this.workoutProgressRepository.getUserProgressMetrics(
      client.id,
      startDate,
      endDate
    );
  }
}
