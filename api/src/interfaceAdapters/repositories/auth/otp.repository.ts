import { injectable } from "tsyringe";
import { IOtpEntity } from "@/entities/models/otp.entity";
import { IOtpRepository } from "@/entities/repositoryInterfaces/auth/otp-repository.interface";
import { OtpModel } from "@/frameworks/database/mongoDB/models/otp.model";

@injectable()
export class OtpRepository implements IOtpRepository {
	async saveOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
		await OtpModel.create({ email, otp, expiresAt });
	}

	async findOtp(email: string): Promise<IOtpEntity | null> {
		const otpEntry = await OtpModel.find({ email })
			.sort({ createdAt: -1 })
			.limit(1);
		return otpEntry.length > 0 ? otpEntry[0] : null;
	}

	async deleteOtp(email: string, otp: string): Promise<void> {
		await OtpModel.deleteOne({ email, otp });
	}
}
