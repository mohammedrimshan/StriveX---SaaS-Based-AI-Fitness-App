import { inject, injectable } from "tsyringe";
import { IRefreshTokenUseCase } from "../../entities/useCaseInterfaces/auth/refresh-token-usecase.interface";
import { ITokenService } from "../../entities/services/token-service.interface";
import { CustomError } from "../../entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";
import { JwtPayload } from "jsonwebtoken";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
	constructor(@inject("ITokenService") private tokenService: ITokenService) {}
	execute(refreshToken: string): { role: string; accessToken: string } {
		const payload = this.tokenService.verifyRefreshToken(refreshToken);
		if (!payload) {
			throw new CustomError(
				ERROR_MESSAGES.INVALID_TOKEN,
				HTTP_STATUS.BAD_REQUEST
			);
		}
		return {
			role: (payload as JwtPayload).role,
			accessToken: this.tokenService.generateAccessToken({
				id: (payload as JwtPayload).id,
				email: (payload as JwtPayload).email,
				role: (payload as JwtPayload).role,
			}),
		};
	}
}
