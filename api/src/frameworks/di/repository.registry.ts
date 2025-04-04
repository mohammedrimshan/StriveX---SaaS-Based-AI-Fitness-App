import { container } from "tsyringe";

import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-repository.interface";
import { ClientRepository } from "@/interfaceAdapters/repositories/client/client.repository";
import { IRedisTokenRepository } from "../../entities/repositoryInterfaces/redis/redis-token-repository.interface";
import { RedisTokenRepository } from "../../interfaceAdapters/repositories/redis/redis-token.repository";
import { IOtpRepository } from "../../entities/repositoryInterfaces/auth/otp-repository.interface";
import { OtpRepository } from "@/interfaceAdapters/repositories/auth/otp.repository";
import { IRefreshTokenRepository } from "@/entities/repositoryInterfaces/auth/refresh-token-repository.interface";
import { RefreshTokenRepository } from "@/interfaceAdapters/repositories/auth/refresh-token.respository";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { AdminRepository } from "@/interfaceAdapters/repositories/admin/admin.repository";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { TrainerRepository } from "@/interfaceAdapters/repositories/trainer/trainer.repository";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { CategoryRepository } from "@/interfaceAdapters/repositories/common/category.repository";
import { IAiWorkoutPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { AiWorkoutPlanRepository } from "@/interfaceAdapters/repositories/client/ai-workout-plan.repository";
import { IAiDietPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { AiDietPlanRepository } from "@/interfaceAdapters/repositories/client/ai-workout-plan.repository";
import { IProgressRepository } from "@/entities/repositoryInterfaces/workout/progress-repository.interface";
import { ProgressRepository } from "@/interfaceAdapters/repositories/workout/progress.repository";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { WorkoutRepository } from "@/interfaceAdapters/repositories/workout/workout.repository";

export class RepositoryRegistry {
  static registerRepositories(): void {
    container.register<IClientRepository>("IClientRepository", {
      useClass: ClientRepository,
    });

    container.register<IOtpRepository>("IOtpRepository", {
      useClass: OtpRepository,
    });

    container.register<IRedisTokenRepository>("IRedisTokenRepository", {
      useClass: RedisTokenRepository,
    });

    container.register<IRefreshTokenRepository>("IRefreshTokenRepository", {
      useClass: RefreshTokenRepository,
    });

    container.register<IAdminRepository>("IAdminRepository", {
      useClass: AdminRepository,
    });

    container.register<ITrainerRepository>("ITrainerRepository", {
      useClass: TrainerRepository,
    });

    container.register<ICategoryRepository>("ICategoryRepository", {
      useClass: CategoryRepository,
    });

    container.register<IAiWorkoutPlanRepository>("IAiWorkoutPlanRepository", {
      useClass: AiWorkoutPlanRepository,
    });

    container.register<IAiDietPlanRepository>("IAiDietPlanRepository", {
      useClass: AiDietPlanRepository,
    });

    container.register<IProgressRepository>("IProgressRepository", {
      useClass: ProgressRepository,
    });

    container.register<IWorkoutRepository>("IWorkoutRepository", {
      useClass: WorkoutRepository,
    });
  }
}
