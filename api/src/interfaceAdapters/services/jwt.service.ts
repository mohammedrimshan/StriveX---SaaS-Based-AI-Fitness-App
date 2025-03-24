import { injectable } from "tsyringe";
import { ITokenService } from "../../entities/services/token-service.interface";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { config } from "../../shared/config";
import ms from "ms";

interface JWTPayloadData {
	id: string;
	email: string;
	role: string;
}

export interface ResetTokenPayload extends JwtPayload {
	email: string;
	role?: string;
}

@injectable()
export class JWTService implements ITokenService {
	private accessSecret: Secret;
	private accessExpiresIn: string;
	private refreshSecret: Secret;
	private refreshExpiresIn: string;
	private resetSecret: Secret;
	private resetExpiresIn: string;

	constructor() {
		this.accessSecret = config.jwt.ACCESS_SECRET_KEY;
		this.accessExpiresIn = config.jwt.ACCESS_EXPIRES_IN;
		this.refreshSecret = config.jwt.REFRESH_SECRET_KEY;
		this.refreshExpiresIn = config.jwt.REFRESH_EXPIRES_IN;
		this.resetSecret = config.jwt.RESET_SECRET_KEY;
		this.resetExpiresIn = config.jwt.RESET_EXPIRES_IN;
	}

	generateAccessToken(payload: {
		id: string;
		email: string;
		role: string;
	}): string {
		return jwt.sign(payload, this.accessSecret, {
			expiresIn: this.accessExpiresIn as ms.StringValue,
		});
	}
	generateRefreshToken(payload: {
		id: string;
		email: string;
		role: string;
	}): string {
		return jwt.sign(payload, this.refreshSecret, {
			expiresIn: this.refreshExpiresIn as ms.StringValue,
		});
	}
	verifyAccessToken(token: string): JwtPayload | null {
		try {
			return jwt.verify(token, this.accessSecret) as JwtPayload;
		} catch (error) {
			console.error("Access token verification failed:", error);
			return null;
		}
	}
	verifyRefreshToken(token: string): string | JwtPayload | null {
		try {
			return jwt.verify(token, this.refreshSecret) as JwtPayload;
		} catch (error) {
			console.error("Access token verification failed:", error);
			return null;
		}
	}
	decodeAccessToken(token: string): JwtPayload | null {
		try {
			return jwt.decode(token) as JwtPayload;
		} catch (error) {
			console.error("Access token decoding failed", error);
			return null;
		}
	}
	generateResetToken(email: string, role: string): string {
		return jwt.sign({ email, role }, this.resetSecret, {
		  expiresIn: this.resetExpiresIn as ms.StringValue,
		});
	  }

	verifyResetToken(token: string): ResetTokenPayload | null {
		try {
			return jwt.verify(token, this.resetSecret) as ResetTokenPayload;
		} catch (error) {
			console.error("Reset token verification failed:", error);
			return null;
		}
	}

	decodeResetToken(token: string): ResetTokenPayload | null {
		try {
			return jwt.decode(token) as ResetTokenPayload;
		} catch (error) {
			console.error("Reset token decoding failed", error);
			return null;
		}
	}
}
