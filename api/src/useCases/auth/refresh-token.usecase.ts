import { inject, injectable } from "tsyringe";
import { IRefreshTokenUseCase } from "../../entities/useCaseInterfaces/auth/refresh-token-usecase.interface";
import { ITokenService } from "../../entities/services/token-service.interface";
import { CustomError } from "../../entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";
import { JwtPayload } from "jsonwebtoken";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @inject("ITokenService") private _tokenService: ITokenService
  ) {}

  execute(refreshToken: string): { role: string; accessToken: string; refreshToken: string } {
    const payload = this._tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_TOKEN,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const userPayload = payload as JwtPayload;

    // Generate new access token
    const newAccessToken = this._tokenService.generateAccessToken({
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
    });

    // Generate new refresh token (rotate)
    const newRefreshToken = this._tokenService.generateRefreshToken({
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
    });

    return {
      role: userPayload.role!,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
