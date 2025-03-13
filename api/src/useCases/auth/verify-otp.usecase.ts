import { inject, injectable } from "tsyringe";
import { IVerifyOtpUseCase } from "../../entities/useCaseInterfaces/auth/verify-otp-usecase.interface";
import { IOtpService } from "../../entities/services/otp-service.interface";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS } from "../../shared/constants";

@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
	constructor(
      @inject("IOtpService") private otpService: IOtpService
   ) {}
	async execute({
		email,
		otp,
	}: {
		email: string;
		otp: string;
	}): Promise<void> {
		const isOtpValid = await this.otpService.verifyOtp(email, otp);

		if (!isOtpValid)
			throw new CustomError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
	}
}
