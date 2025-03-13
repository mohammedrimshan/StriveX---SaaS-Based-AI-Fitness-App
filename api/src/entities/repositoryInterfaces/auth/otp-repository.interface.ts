import { IOtpEntity } from "@/entities/models/otp.entity";

export interface IOtpRepository {
	saveOtp(email: string, otp: string, expiresAt: Date): Promise<void>;
	findOtp(email: string): Promise<IOtpEntity | null>;
	deleteOtp(email: string, otp: string): Promise<void>;
}
