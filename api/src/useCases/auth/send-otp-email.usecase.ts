import { inject, injectable } from "tsyringe";
import { ISendOtpEmailUseCase } from "@/entities/useCaseInterfaces/auth/send-otp-usecase.interface";
import { IEmailService } from "../../entities/services/email-service.interface";
import { IOtpService } from "./../../entities/services/otp-service.interface";
import { IUserExistenceService } from "@/entities/services/user-exist-service.interface";
import { IBcrypt } from "../../frameworks/security/bcrypt.interface";
import { CustomError } from "../../entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";

@injectable()
export class SendOtpEmailUseCase implements ISendOtpEmailUseCase {
	constructor(
		@inject("IEmailService") private emailService: IEmailService,
		@inject("IOtpService") private otpService: IOtpService,
		@inject("IUserExistenceService")
		private userExistenceService: IUserExistenceService,
		@inject("IOtpBcrypt") private otpBcrypt: IBcrypt
	) {}
	async execute(email: string): Promise<void> {
		const emailExists = await this.userExistenceService.emailExists(email);
		if (emailExists) {
			throw new CustomError(
				ERROR_MESSAGES.EMAIL_EXISTS,
				HTTP_STATUS.CONFLICT
			);
		}

		const otp = this.otpService.generateOtp();
		console.log(`OTP:${otp} `);
		const hashedOtp = await this.otpBcrypt.hash(otp);
		await this.otpService.storeOtp(email, hashedOtp);
		await this.emailService.sendOtpEmail(
			email,
			"StriveX - Verify Your Email",
			otp
		);
	}
}
