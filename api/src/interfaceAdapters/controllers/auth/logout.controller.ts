import { Request, Response } from "express";
import { ILogoutUserController } from "../../../entities/controllerInterfaces/auth/logout-controller.interface";
import { inject, injectable } from "tsyringe";
import { IBlackListTokenUseCase } from "./../../../entities/useCaseInterfaces/auth/blacklist-token-usecase.interface";
import { IRevokeRefreshTokenUseCase } from "../../../entities/useCaseInterfaces/auth/revoke-refresh-token-usecase.interface";
import {
	ERROR_MESSAGES,
	HTTP_STATUS,
	SUCCESS_MESSAGES,
} from "../../../shared/constants";
import { CustomError } from "../../../entities/utils/custom.error";
import { ZodError } from "zod";
import { CustomRequest } from "../../middlewares/auth.middleware";
import { clearAuthCookies } from "../../../shared/utils/cookieHelper";

@injectable()
export class LogoutUserController implements ILogoutUserController {
	constructor(
		@inject("IBlackListTokenUseCase")
		private blackListTokenUseCase: IBlackListTokenUseCase,
		@inject("IRevokeRefreshTokenUseCase")
		private revokeRefreshToken: IRevokeRefreshTokenUseCase
	) {}
	async handle(req: Request, res: Response): Promise<void> {
		try {
			await this.blackListTokenUseCase.execute(
				(req as CustomRequest).user.access_token
			);

			await this.revokeRefreshToken.execute(
				(req as CustomRequest).user.refresh_token
			);

			const user = (req as CustomRequest).user;
			const accessTokenName = `${user.role}_access_token`;
			const refreshTokenName = `${user.role}_refresh_token`;
			clearAuthCookies(res, accessTokenName, refreshTokenName);
			res.status(HTTP_STATUS.OK).json({
				success: true,
				message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
			});
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = error.errors.map((err) => ({
					message: err.message,
				}));

				res.status(HTTP_STATUS.BAD_REQUEST).json({
					success: false,
					message: ERROR_MESSAGES.VALIDATION_ERROR,
					errors,
				});
				return;
			}
			if (error instanceof CustomError) {
				res.status(error.statusCode).json({
					success: false,
					message: error.message,
				});
				return;
			}
			console.log(error);
			res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: ERROR_MESSAGES.SERVER_ERROR,
			});
		}
	}
}
