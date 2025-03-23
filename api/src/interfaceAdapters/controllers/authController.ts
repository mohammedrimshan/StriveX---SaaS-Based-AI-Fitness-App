import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { IAuthController } from "@/entities/controllerInterfaces/auth-controller.interface";
import { IGoogleUseCase } from "@/entities/useCaseInterfaces/auth/google-auth.usecase.interface";
import { IGenerateTokenUseCase } from "@/entities/useCaseInterfaces/auth/generate-token-usecase.interface";
import { ILoginUserUseCase } from "@/entities/useCaseInterfaces/auth/login-usecase.interface";
import { IBlackListTokenUseCase } from "@/entities/useCaseInterfaces/auth/blacklist-token-usecase.interface";
import { IRevokeRefreshTokenUseCase } from "@/entities/useCaseInterfaces/auth/revoke-refresh-token-usecase.interface";
import { IRefreshTokenUseCase } from "@/entities/useCaseInterfaces/auth/refresh-token-usecase.interface";
import { IRegisterUserUseCase } from "@/entities/useCaseInterfaces/auth/register-usecase.interface";
import { ISendOtpEmailUseCase } from "@/entities/useCaseInterfaces/auth/send-otp-usecase.interface";
import { IVerifyOtpUseCase } from "@/entities/useCaseInterfaces/auth/verify-otp-usecase.interface";
import {
  setAuthCookies,
  clearAuthCookies,
  updateCookieWithAccessToken,
} from "@/shared/utils/cookieHelper";
import {
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "@/shared/constants";
import { LoginUserDTO, UserDTO } from "@/shared/dto/user.dto";
import { loginSchema } from "./auth/validations/user-login.validation.schema";
import { userSchemas } from "./auth/validations/user-signup.validation.schema";
import { otpMailValidationSchema } from "./auth/validations/otp-mail.validation.schema";
import { CustomRequest } from "../middlewares/auth.middleware";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { IForgotPasswordUseCase } from "@/entities/useCaseInterfaces/auth/forgot-password-usecase.interface";
import { forgotPasswordValidationSchema } from "./auth/validations/forgot-password.validation.schema";
import { IResetPasswordUseCase } from "@/entities/useCaseInterfaces/auth/reset-password-usecase.interface";
import { resetPasswordValidationSchema } from "./auth/validations/reset-password.validation.schema";
import { ZodError } from "zod";


@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject("IGoogleUseCase")
    private googleUseCase: IGoogleUseCase,
    @inject("IGenerateTokenUseCase")
    private generateTokenUseCase: IGenerateTokenUseCase,
    @inject("ILoginUserUseCase")
    private loginUserUseCase: ILoginUserUseCase,
    @inject("IBlackListTokenUseCase")
    private blackListTokenUseCase: IBlackListTokenUseCase,
    @inject("IRevokeRefreshTokenUseCase")
    private revokeRefreshToken: IRevokeRefreshTokenUseCase,
    @inject("IRefreshTokenUseCase")
    private refreshTokenUseCase: IRefreshTokenUseCase,
    @inject("IRegisterUserUseCase")
    private registerUserUseCase: IRegisterUserUseCase,
    @inject("ISendOtpEmailUseCase")
    private sendOtpEmailUseCase: ISendOtpEmailUseCase,
    @inject("IVerifyOtpUseCase")
    private verifyOtpUseCase: IVerifyOtpUseCase,
    @inject("IForgotPasswordUseCase")
    private forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject("IResetPasswordUseCase")
    private resetPasswordUseCase: IResetPasswordUseCase
  ) {}

  //*                  🔑 Google Authentication
  async authenticateWithGoogle(req: Request, res: Response): Promise<void> {
    try {
      const { credential, client_id, role } = req.body;
      const user = await this.googleUseCase.execute(
        credential,
        client_id,
        role
      );
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

  //*                  🔔 Forgot Password
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = forgotPasswordValidationSchema.parse(req.body);
      if (!validatedData) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
        });
      }
      await this.forgotPasswordUseCase.execute(validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_SENT_SUCCESSFULLY,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  //*                  🛠️ User Login
  async login(req: Request, res: Response): Promise<void> {
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
      handleErrorResponse(res, error);
    }
  }

  //*                  🚪 User Logout
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as CustomRequest).user;
      console.log("User data in logout:", {
        id: user.id,
        role: user.role,
        access_token: user.access_token,
        refresh_token: user.refresh_token,
      });
  
      if (!user.access_token || !user.refresh_token) {
        throw new Error("Missing access or refresh token");
      }
  
      await this.blackListTokenUseCase.execute(user.access_token);
      console.log("Access token blacklisted");
  
      await this.revokeRefreshToken.execute(user.refresh_token);
      console.log("Refresh token revoked");
  
      const accessTokenName = `${user.role}_access_token`;
      const refreshTokenName = `${user.role}_refresh_token`;
      clearAuthCookies(res, accessTokenName, refreshTokenName);
      console.log("Cookies cleared");
  
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Logout error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
          details: error instanceof ZodError ? error.errors : null,
        });
      } else {
        console.error("Logout error (non-Error type):", error);
      }
      handleErrorResponse(res, error);
    }
  }
  
  //*                  🔄 Token Refresh
  handleTokenRefresh(req: Request, res: Response): void {
    try {
      const refreshToken = (req as CustomRequest).user.refresh_token;
      const newTokens = this.refreshTokenUseCase.execute(refreshToken);
      const accessTokenName = `${newTokens.role}_access_token`;
      updateCookieWithAccessToken(res, newTokens.accessToken, accessTokenName);
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

  //*                  📝 User Registration
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.body as UserDTO;
      console.log("Signup Request Body:", req.body);

      const schema = userSchemas[role];

      if (!schema) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ROLE,
        });
        return;
      }

      const validatedData = schema.parse(req.body);

      await this.registerUserUseCase.execute(validatedData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  //*                  🔒 Reset Password
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = resetPasswordValidationSchema.parse(req.body);
      if (!validatedData) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
        });
      }

      await this.resetPasswordUseCase.execute(validatedData);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  //*                  📧 Send OTP Email
  async sendOtpEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await this.sendOtpEmailUseCase.execute(email);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.OTP_SENT_SUCCESS,
        success: true,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  //*                  ✅ Verify OTP
  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const validatedData = otpMailValidationSchema.parse({ email, otp });
      await this.verifyOtpUseCase.execute(validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.VERIFICATION_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
