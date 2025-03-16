import { container } from "tsyringe";

import { IBcrypt } from "../../frameworks/security/bcrypt.interface";
import { PasswordBcrypt } from "../../frameworks/security/password.bcrypt";
import { OtpBcrypt } from "../security/otp.bcrypt";

import { ClientRegisterStrategy } from "../../useCases/auth/register-strategies/client-register.stratergy";
import { ClientLoginStrategy } from "@/useCases/auth/login-strategies/client-login.strategy";
import { IOtpService } from "../../entities/services/otp-service.interface";
import { OtpService } from "../../interfaceAdapters/services/otp.service";
import { IEmailService } from "../../entities/services/email-service.interface";
import { EmailService } from "../../interfaceAdapters/services/emai.service";
import { IUserExistenceService } from "../../entities/services/user-exist-service.interface";
import { UserExistenceService } from "../../interfaceAdapters/services/user-existance.service";
import { ITokenService } from "../../entities/services/token-service.interface";
import { JWTService } from "../../interfaceAdapters/services/jwt.service";

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

		//* ====== Register Strategies ====== *//
		container.register("ClientRegisterStrategy", {
			useClass: ClientRegisterStrategy,
		});

		container.register("ClientLoginStrategy", {
			useClass: ClientLoginStrategy,
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
	}
}