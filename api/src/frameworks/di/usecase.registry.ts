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

    container.register<IUpdateUserProfileUseCase>("IUpdateUserProfileUseCase",{
      useClass:UpdateUserProfileUseCase,
    });

    container.register<IUpdateClientPasswordUseCase>("IUpdateClientPasswordUseCase",{
      useClass:UpdateClientPasswordUseCase
    });
  }
}
