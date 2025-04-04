import { container } from "tsyringe";

import { IBcrypt } from "../../frameworks/security/bcrypt.interface";
import { PasswordBcrypt } from "../../frameworks/security/password.bcrypt";
import { OtpBcrypt } from "../security/otp.bcrypt";

import { IRegisterStrategy } from "@/useCases/auth/register-strategies/register-strategy.interface";
import { ClientRegisterStrategy } from "../../useCases/auth/register-strategies/client-register.stratergy";
import { ClientLoginStrategy } from "@/useCases/auth/login-strategies/client-login.strategy";
import { AdminRegisterStrategy } from "@/useCases/auth/register-strategies/admin-register.strategy";
import { AdminLoginStrategy } from "@/useCases/auth/login-strategies/admin-login.strategy";
import { TrainerRegisterStrategy } from "@/useCases/auth/register-strategies/trainer-register.strategy";
import { TrainerLoginStrategy } from "@/useCases/auth/login-strategies/trainer-login.strategy";


import { IOtpService } from "../../entities/services/otp-service.interface";
import { OtpService } from "../../interfaceAdapters/services/otp.service";
import { IEmailService } from "../../entities/services/email-service.interface";
import { EmailService } from "../../interfaceAdapters/services/emai.service";
import { IUserExistenceService } from "../../entities/services/user-exist-service.interface";
import { UserExistenceService } from "../../interfaceAdapters/services/user-existance.service";
import { ITokenService } from "../../entities/services/token-service.interface";
import { JWTService } from "../../interfaceAdapters/services/jwt.service";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";
import { CloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";

import { GeminiService } from "@/interfaceAdapters/services/gemini.service";

import { IRegisterUserUseCase } from "../../entities/useCaseInterfaces/auth/register-usecase.interface";
import { RegisterUserUseCase } from "../../useCases/auth/register-user.usecase";
import { ISendOtpEmailUseCase } from "../../entities/useCaseInterfaces/auth/send-otp-usecase.interface";
import { SendOtpEmailUseCase } from "../../useCases/auth/send-otp-email.usecase";
import { IVerifyOtpUseCase } from "../../entities/useCaseInterfaces/auth/verify-otp-usecase.interface";
import { VerifyOtpUseCase } from "../../useCases/auth/verify-otp.usecase";
import { ILoginUserUseCase } from "../../entities/useCaseInterfaces/auth/login-usecase.interface";
import { LoginUserUseCase } from "../../useCases/auth/login-user.usecase";
import { IGenerateTokenUseCase } from "../../entities/useCaseInterfaces/auth/generate-token-usecase.interface";
import { GenerateTokenUseCase } from "../../useCases/auth/generate-token.usecase";
import { IBlackListTokenUseCase } from "../../entities/useCaseInterfaces/auth/blacklist-token-usecase.interface";
import { BlackListTokenUseCase } from "../../useCases/auth/blacklist-token.usecase";
import { IRevokeRefreshTokenUseCase } from "../../entities/useCaseInterfaces/auth/revoke-refresh-token-usecase.interface";
import { RevokeRefreshTokenUseCase } from "../../useCases/auth/revoke-refresh-token.usecase";
import { IRefreshTokenUseCase } from "../../entities/useCaseInterfaces/auth/refresh-token-usecase.interface";
import { RefreshTokenUseCase } from "../../useCases/auth/refresh-token.usecase";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { GetAllUsersUseCase } from "@/useCases/user/get-all-users.usecase";
import { UpdateUserStatusUseCase } from "@/useCases/user/update-user-status.usecase";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { TrainerVerificationUseCase } from "@/useCases/trainer/trainer-verification.usecase";
import { ITrainerVerificationUseCase } from "@/entities/useCaseInterfaces/admin/trainer-verification-usecase.interface";
import { GoogleUseCase } from "@/useCases/auth/google-auth.usecase";
import { IGoogleUseCase } from "@/entities/useCaseInterfaces/auth/google-auth.usecase.interface";
import { IForgotPasswordUseCase } from "@/entities/useCaseInterfaces/auth/forgot-password-usecase.interface";
import { ForgotPasswordUseCase } from "@/useCases/auth/forgot-password.usecase";
import { IResetPasswordUseCase } from "@/entities/useCaseInterfaces/auth/reset-password-usecase.interface";
import { ResetPasswordUseCase } from "@/useCases/auth/reset-password.usecase";
import { IUpdateUserProfileUseCase } from "@/entities/useCaseInterfaces/users/update-user-profile-usecase.interface";
import { UpdateUserProfileUseCase } from "@/useCases/user/update-user-profile.usecase";
import { UpdateClientPasswordUseCase } from "@/useCases/user/change-logged-in-user-password.usecase";
import { IUpdateClientPasswordUseCase } from "@/entities/useCaseInterfaces/users/change-logged-in-user-password-usecase.interface";
import { IUpdateTrainerProfileUseCase } from "@/entities/useCaseInterfaces/trainer/update-trainer-profile.usecase.interface";
import { UpdateTrainerProfileUseCase } from "@/useCases/trainer/update-trainer-profile.usecase";
import { IGetAllCategoriesUseCase } from "@/entities/useCaseInterfaces/common/get-all-category.interface";
import { GetAllCategoriesUseCase } from "@/useCases/common/get-all-categories.usecase";
import { ICreateNewCategoryUseCase } from "@/entities/useCaseInterfaces/admin/create-new-category.interface";
import { CreateNewCategoryUseCase } from "@/useCases/admin/create-new-category.usecase";
import { IGetAllPaginatedCategoryUseCase } from "@/entities/useCaseInterfaces/admin/get-all-paginated-category-usecase.interface";
import { GetAllPaginatedCategoryUseCase } from "@/useCases/admin/get-all-paginated-category.usecase";
import { IUpdateCategoryStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-category-status-usecase.interface";
import { UpdateCategoryStatusUseCase } from "@/useCases/admin/update-category-status.usecase";
import { IUpdateCategoryUseCase } from "@/entities/useCaseInterfaces/admin/update-category-usecase.interface";
import { UpdateCategoryUseCase } from "@/useCases/admin/update-category.usecase";
import { IDeleteCategoryUseCase } from "@/entities/useCaseInterfaces/admin/delete-category-usecase.interface";
import { DeleteCategoryUseCase } from "@/useCases/admin/delete-category.usecase";
import { IGenerateWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-workout-plans.usecase.interface";
import { GenerateWorkoutPlanUseCase } from "@/useCases/user/generate-workoutplan.usecase";
import { IGenerateDietPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-diet-plans.usecase.interface";
import { GenerateDietPlanUseCase } from "@/useCases/user/generate-dietplan.usecase";
import { IGetWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/get-workout-plans.usecase.interface";
import { GetWorkoutPlanUseCase } from "@/useCases/user/get-workoutplan.usecase";
import { IGetDietPlanUseCase } from "@/entities/useCaseInterfaces/users/get-diet-plans.usecase.interface";
import { GetDietPlanUseCase } from "@/useCases/user/get-dietplan.usecase";
import { IUpdateTrainerPasswordUseCase } from "@/entities/useCaseInterfaces/trainer/update-trainer-password.usecase.interface";
import { UpdateTrainerPasswordUseCase } from "@/useCases/trainer/change-logged-in-trainer-password.usecase";
import { IAddWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/add-workout-usecase.interface";
import { AddWorkoutUseCase } from "@/useCases/workout/add-workout.usecase";
import { IUpdateWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/update-workout-usecase.interface";
import { UpdateWorkoutUseCase } from "@/useCases/workout/update-workout.usecase";
import { IToggleWorkoutStatusUseCase } from "@/entities/useCaseInterfaces/workout/toggle-workout-usecase.interface";
import { ToggleWorkoutStatusUseCase } from "@/useCases/workout/toggle-workout-status.usecase";
import { IDeleteWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/delete-workout-usecase.interface";
import { DeleteWorkoutUseCase } from "@/useCases/workout/delete-workout.usecase";
import { IGetWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-usecase.interface";
import { GetWorkoutsUseCase } from "@/useCases/workout/get-workouts.usecase";
import { IGetWorkoutsByCategoryUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-category-usecase.interface";
import { GetWorkoutsByCategoryUseCase } from "@/useCases/workout/get-workouts-by-category.usecase";
import { IRecordProgressUseCase } from "@/entities/useCaseInterfaces/workout/record-progress-usecase.interface";
import { RecordProgressUseCase } from "@/useCases/workout/record-progress.usecase";
import { IGetUserProgressUseCase } from "@/entities/useCaseInterfaces/workout/get-user-progress-usecase.interface";
import { GetUserProgressUseCase } from "@/useCases/workout/get-user-progress.usecase";
import { IGetAllAdminWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-all-workouts-usecase.interface";
import { GetAllAdminWorkoutsUseCase } from "@/useCases/workout/get-all-admin-workouts.usecase";
import { IGetAllTrainersUseCase } from "@/entities/useCaseInterfaces/users/get-all-trainers.usecase.interface";
import { GetAllTrainersUseCase } from "@/useCases/user/get-all-trainers.usecase";

export class UseCaseRegistry {
  static registerUseCases(): void {
    //* ====== Register Bcrypts ====== *//
    container.register<IBcrypt>("IPasswordBcrypt", {
      useClass: PasswordBcrypt,
    });

    container.register<IBcrypt>("IOtpBcrypt", {
      useClass: OtpBcrypt,
    });

    //* ====== Register Services ====== *//
    container.register<IEmailService>("IEmailService", {
      useClass: EmailService,
    });

    container.register<IOtpService>("IOtpService", {
      useClass: OtpService,
    });

    container.register<IUserExistenceService>("IUserExistenceService", {
      useClass: UserExistenceService,
    });

    container.register<ITokenService>("ITokenService", {
      useClass: JWTService,
    });

    container.register<ICloudinaryService>("ICloudinaryService", {
      useClass: CloudinaryService,
    });

    container.register<GeminiService>("GeminiService", {
      useClass: GeminiService,
    });

    //* ====== Register Strategies ====== *//
    container.register("ClientRegisterStrategy", {
      useClass: ClientRegisterStrategy,
    });

    container.register("ClientLoginStrategy", {
      useClass: ClientLoginStrategy,
    });

    container.register<IRegisterStrategy>("AdminRegisterStrategy", {
      useClass: AdminRegisterStrategy,
    });

    container.register("AdminLoginStrategy", {
      useClass: AdminLoginStrategy,
    });

    container.register<IRegisterStrategy>("TrainerRegisterStrategy", {
      useClass: TrainerRegisterStrategy,
    });

    container.register("TrainerLoginStrategy", {
      useClass: TrainerLoginStrategy,
    });

    //* ====== Register UseCases ====== *//
    container.register<IRegisterUserUseCase>("IRegisterUserUseCase", {
      useClass: RegisterUserUseCase,
    });

    container.register<ISendOtpEmailUseCase>("ISendOtpEmailUseCase", {
      useClass: SendOtpEmailUseCase,
    });

    container.register<IVerifyOtpUseCase>("IVerifyOtpUseCase", {
      useClass: VerifyOtpUseCase,
    });

    container.register<ILoginUserUseCase>("ILoginUserUseCase", {
      useClass: LoginUserUseCase,
    });

    container.register<IGenerateTokenUseCase>("IGenerateTokenUseCase", {
      useClass: GenerateTokenUseCase,
    });

    container.register<IBlackListTokenUseCase>("IBlackListTokenUseCase", {
      useClass: BlackListTokenUseCase,
    });

    container.register<IRevokeRefreshTokenUseCase>(
      "IRevokeRefreshTokenUseCase",
      {
        useClass: RevokeRefreshTokenUseCase,
      }
    );

    container.register<IRefreshTokenUseCase>("IRefreshTokenUseCase", {
      useClass: RefreshTokenUseCase,
    });

    container.register<IGetAllUsersUseCase>("IGetAllUsersUseCase", {
      useClass: GetAllUsersUseCase,
    });

    container.register<IUpdateUserStatusUseCase>("IUpdateUserStatusUseCase", {
      useClass: UpdateUserStatusUseCase,
    });

    container.register<IGoogleUseCase>("IGoogleUseCase", {
      useClass: GoogleUseCase,
    });

    container.register<ITrainerVerificationUseCase>(
      "ITrainerVerificationUseCase",
      { useClass: TrainerVerificationUseCase }
    );

    container.register<IForgotPasswordUseCase>("IForgotPasswordUseCase", {
      useClass: ForgotPasswordUseCase,
    });

    container.register<IResetPasswordUseCase>("IResetPasswordUseCase", {
      useClass: ResetPasswordUseCase,
    });

    container.register<IUpdateUserProfileUseCase>("IUpdateUserProfileUseCase", {
      useClass: UpdateUserProfileUseCase,
    });

    container.register<IUpdateClientPasswordUseCase>(
      "IUpdateClientPasswordUseCase",
      {
        useClass: UpdateClientPasswordUseCase,
      }
    );

    container.register<IUpdateTrainerProfileUseCase>(
      "IUpdateTrainerProfileUseCase",
      {
        useClass: UpdateTrainerProfileUseCase,
      }
    );

    container.register<IGetAllCategoriesUseCase>("IGetAllCategoriesUseCase", {
      useClass: GetAllCategoriesUseCase,
    });

    container.register<ICreateNewCategoryUseCase>("ICreateNewCategoryUseCase", {
      useClass: CreateNewCategoryUseCase,
    });

    container.register<IGetAllPaginatedCategoryUseCase>(
      "IGetAllPaginatedCategoryUseCase",
      {
        useClass: GetAllPaginatedCategoryUseCase,
      }
    );

    container.register<IUpdateCategoryStatusUseCase>(
      "IUpdateCategoryStatusUseCase",
      {
        useClass: UpdateCategoryStatusUseCase,
      }
    );

    container.register<IUpdateCategoryUseCase>("IUpdateCategoryUseCase", {
      useClass: UpdateCategoryUseCase,
    });

    container.register<IDeleteCategoryUseCase>("IDeleteCategoryUseCase", {
      useClass: DeleteCategoryUseCase,
    });

    container.register<IGenerateWorkoutPlanUseCase>(
      "IGenerateWorkoutPlanUseCase",
      {
        useClass: GenerateWorkoutPlanUseCase,
      }
    );

    container.register<IGenerateDietPlanUseCase>("IGenerateDietPlanUseCase", {
      useClass: GenerateDietPlanUseCase,
    });

    container.register<IGetWorkoutPlanUseCase>("IGetWorkoutPlanUseCase", {
      useClass: GetWorkoutPlanUseCase,
    });

    container.register<IGetDietPlanUseCase>("IGetDietPlanUseCase", {
      useClass: GetDietPlanUseCase,
    });

    container.register<IUpdateTrainerPasswordUseCase>(
      "IUpdateTrainerPasswordUseCase",
      {
        useClass: UpdateTrainerPasswordUseCase,
      }
    );

    container.register<IAddWorkoutUseCase>("IAddWorkoutUseCase", {
      useClass: AddWorkoutUseCase,
    });

    container.register<IUpdateWorkoutUseCase>("IUpdateWorkoutUseCase", {
      useClass: UpdateWorkoutUseCase,
    });

    container.register<IDeleteWorkoutUseCase>("IDeleteWorkoutUseCase", {
      useClass: DeleteWorkoutUseCase,
    });

    container.register<IToggleWorkoutStatusUseCase>("IToggleWorkoutStatusUseCase", {
      useClass: ToggleWorkoutStatusUseCase,
    });

    container.register<IGetWorkoutsUseCase>("IGetWorkoutsUseCase", {
      useClass: GetWorkoutsUseCase,
    });

    container.register<IGetWorkoutsByCategoryUseCase>("IGetWorkoutsByCategoryUseCase", {
      useClass: GetWorkoutsByCategoryUseCase,
    });

    container.register<IRecordProgressUseCase>("IRecordProgressUseCase", {
      useClass: RecordProgressUseCase,
    });

    container.register<IGetUserProgressUseCase>("IGetUserProgressUseCase", {
      useClass: GetUserProgressUseCase,
    });

    container.register<IGetAllAdminWorkoutsUseCase>("IGetAllAdminWorkoutsUseCase", {
      useClass: GetAllAdminWorkoutsUseCase,
    });

    container.register<IGetAllTrainersUseCase>("IGetAllTrainersUseCase", {
      useClass: GetAllTrainersUseCase,
    });
  }
}
