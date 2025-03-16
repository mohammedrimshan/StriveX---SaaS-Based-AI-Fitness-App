import { Request, Response } from "express";
import { ILoginUserController } from "../../../entities/controllerInterfaces/auth/login-controller.interface";
import { inject, injectable } from "tsyringe";
import { ILoginUserUseCase } from "../../../entities/useCaseInterfaces/auth/login-usecase.interface";
import { ZodError } from "zod";
import {
	ERROR_MESSAGES,
	HTTP_STATUS,
	SUCCESS_MESSAGES,
} from "../../../shared/constants";
import { CustomError } from "../../../entities/utils/custom.error";
import { LoginUserDTO } from "../../../shared/dto/user.dto";
import { loginSchema } from "./validations/user-login.validation.schema";
import { IGenerateTokenUseCase } from "../../../entities/useCaseInterfaces/auth/generate-token-usecase.interface";
import { setAuthCookies } from "../../../shared/utils/cookieHelper";

@injectable()
export class LoginUserController implements ILoginUserController {
	constructor(
		@inject("ILoginUserUseCase")
		private loginUserUseCase: ILoginUserUseCase,
		@inject("IGenerateTokenUseCase")
		private generateTokenUseCase: IGenerateTokenUseCase
	) {}
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const data = req.body as LoginUserDTO;
			const validatedData = loginSchema.parse(data);
			if (!validatedData) {
				res.status(HTTP_STATUS.BAD_REQUEST).json({
					success: false,
					message: ERROR_MESSAGES.INVALID_CREDENTIALS,
				});
			}
			const user = await this.loginUserUseCase.execute(validatedData);

			if (!user.id || !user.email || !user.role) {
				throw new Error("User ID, email, or role is missing");
			}

			const tokens = await this.generateTokenUseCase.execute(
				user.id,
				user.email,
				user.role
			);

			const accessTokenName = `${user.role}_access_token`;
			const refreshTokenName = `${user.role}_refresh_token`;

			setAuthCookies(
				res,
				tokens.accessToken,
				tokens.refreshToken,
				accessTokenName,
				refreshTokenName
			);

			res.status(HTTP_STATUS.OK).json({
				success: true,
				message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
				user: {
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					profileImage: user?.profileImage,
					email: user.email,
					role: user.role,
				},
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
			console.log("Error at Register-controller", error);
			res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: ERROR_MESSAGES.SERVER_ERROR,
			});
		}
	}
}
