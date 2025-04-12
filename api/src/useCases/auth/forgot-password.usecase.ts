import { inject, injectable } from "tsyringe";
import { IForgotPasswordUseCase } from "@/entities/useCaseInterfaces/auth/forgot-password-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { ITokenService } from "@/entities/services/token-service.interface";
import { IRedisTokenRepository } from "@/entities/repositoryInterfaces/redis/redis-token-repository.interface";
import { IEmailService } from "@/entities/services/email-service.interface";
import { config } from "@/shared/config";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
	constructor(
		@inject("IClientRepository")
         private _clientRepository: IClientRepository,
		@inject("ITrainerRepository")
         private _trainerRepository: ITrainerRepository,
		@inject("IAdminRepository")
         private _adminRepository: IAdminRepository,
		@inject("ITokenService")
         private _tokenService: ITokenService,
		@inject("IRedisTokenRepository")
         private _redisTokenRepository: IRedisTokenRepository,
		@inject("IEmailService")
         private _emailService: IEmailService
	) {}

	async execute({ email, role }: { email: string; role: string }): Promise<void> {
		let repository;
		if (role === "client") {
			repository = this._clientRepository;
		} else if (role === "trainer") {
			repository = this._trainerRepository;
		} else if (role === "admin") {
			repository = this._adminRepository;
		} else {
			throw new CustomError(ERROR_MESSAGES.INVALID_ROLE, HTTP_STATUS.FORBIDDEN);
		}

		const user = await repository.findByEmail(email);
		if (!user) {
			throw new CustomError(ERROR_MESSAGES.EMAIL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
		}

		const resetToken = this._tokenService.generateResetToken(email, role);
		try {
			await this._redisTokenRepository.storeResetToken(user.id ?? "", resetToken);
		} catch (error) {
			console.error("Failed to store reset token in Redis:", error);
			throw new CustomError(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
		}

		const resetUrl = new URL(`/reset-password/${resetToken}`, config.cors.ALLOWED_ORIGIN).toString();
		await this._emailService.sendResetEmail(email, "StriveX - Change your password", resetUrl);
	}
}
