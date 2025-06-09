
import { injectable, inject } from "tsyringe";

import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { IPopularWorkout } from "@/entities/models/admin-dashboard.entity";
import { IAdminDashboardRepository } from "@/entities/repositoryInterfaces/admin/admin-dashboard-repository.interface";
import { IGetPopularWorkoutsUseCase } from "@/entities/useCaseInterfaces/admin/dashboard/get-popular-workout.usecase";

@injectable()
export class GetPopularWorkoutsUseCase implements IGetPopularWorkoutsUseCase {
  constructor(
    @inject("IAdminDashboardRepository") private repository: IAdminDashboardRepository
  ) {}

  async execute(limit: number = 5): Promise<IPopularWorkout[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new CustomError("Invalid limit provided", HTTP_STATUS.BAD_REQUEST);
    }
    return await this.repository.getPopularWorkouts(limit);
  }
}
