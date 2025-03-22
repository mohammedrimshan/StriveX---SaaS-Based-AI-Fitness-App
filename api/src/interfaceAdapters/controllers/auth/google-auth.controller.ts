import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { IGoogleUseCase } from "@/entities/useCaseInterfaces/auth/google-auth.usecase.interface";
import { IGenerateTokenUseCase } from "@/entities/useCaseInterfaces/auth/generate-token-usecase.interface";
import { setAuthCookies } from "@/shared/utils/cookieHelper";
import { SUCCESS_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { IAuthenticateWithGoogle } from "@/entities/controllerInterfaces/auth/google-auth-controller.interface"; 
@injectable()
export class AuthController implements IAuthenticateWithGoogle {
    constructor(
        @inject("IGoogleUseCase") private googleUseCase: IGoogleUseCase,
        @inject("IGenerateTokenUseCase") private generateTokenUseCase: IGenerateTokenUseCase
      ) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { credential, client_id, role } = req.body;
      const user = await this.googleUseCase.execute(credential, client_id, role);
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
      console.log(user);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: user,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}