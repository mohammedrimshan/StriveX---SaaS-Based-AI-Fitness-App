import { container } from "tsyringe";

import { IBcrypt } from "../../frameworks/security/bcrypt.interface";
import { PasswordBcrypt } from "../../frameworks/security/password.bcrypt";
import { OtpBcrypt } from "../security/otp.bcrypt";


import { ClientRegisterStrategy } from "../../useCases/auth/register-strategies/client-register.stratergy";

import { IOtpService } from "../../entities/services/otp-service.interface";
import { OtpService } from "../../interfaceAdapters/services/otp.service";
import { IEmailService } from "../../entities/services/email-service.interface";
import { EmailService } from "../../interfaceAdapters/services/emai.service";
import { IUserExistenceService } from "../../entities/services/user-exist-service.interface";
import { UserExistenceService } from "../../interfaceAdapters/services/user-existance.service";

import { IRegisterUserUseCase } from "../../entities/useCaseInterfaces/auth/register-usecase.interface";
import { RegisterUserUseCase } from "../../useCases/auth/register-user.usecase";
import { SendOtpEmailUseCase } from "../../useCases/auth/send-otp-email.usecase";
import { ISendOtpEmailUseCase } from "../../entities/useCaseInterfaces/auth/send-otp-usecase.interface";
import { IVerifyOtpUseCase } from "../../entities/useCaseInterfaces/auth/verify-otp-usecase.interface";
import { VerifyOtpUseCase } from "../../useCases/auth/verify-otp.usecase";



export class UseCaseRegistry {
	static registerUseCases(): void {
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


        container.register("ClientRegisterStrategy", {
			useClass: ClientRegisterStrategy,
		});

		
	}
}
