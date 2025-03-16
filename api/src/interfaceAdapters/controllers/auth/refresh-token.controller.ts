import { Request, Response } from "express";
import { IRefreshTokenController } from "../../../entities/controllerInterfaces/auth/refresh-token-controller.interface";
import {
	clearAuthCookies,
	updateCookieWithAccessToken,
} from "../../../shared/utils/cookieHelper";
import { CustomRequest } from "../../middlewares/auth.middleware";
import {
	ERROR_MESSAGES,
	HTTP_STATUS,
	SUCCESS_MESSAGES,
} from "../../../shared/constants";
import { inject, injectable } from "tsyringe";
import { IRefreshTokenUseCase } from "../../../entities/useCaseInterfaces/auth/refresh-token-usecase.interface";

@injectable()
export class RefreshTokenController implements IRefreshTokenController {
	constructor(
		@inject("IRefreshTokenUseCase")
		private refreshTokenUseCase: IRefreshTokenUseCase
	) {}

	handle(req: Request, res: Response): void {
		try {
			const refreshToken = (req as CustomRequest).user.refresh_token;
			const newTokens = this.refreshTokenUseCase.execute(refreshToken);
			const accessTokenName = `${newTokens.role}_access_token`;
			updateCookieWithAccessToken(
				res,
				newTokens.accessToken,
				accessTokenName
			);
			res.status(HTTP_STATUS.OK).json({
				success: true,
				message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
			});
		} catch (error) {
			clearAuthCookies(
				res,
				`${(req as CustomRequest).user.role}_access_token`,
				`${(req as CustomRequest).user.role}_refresh_token`
			);
			res.status(HTTP_STATUS.UNAUTHORIZED).json({
				message: ERROR_MESSAGES.INVALID_TOKEN,
			});
		}
	}
}
