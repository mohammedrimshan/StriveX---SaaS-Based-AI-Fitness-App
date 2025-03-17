import { container } from "tsyringe";
import { DependancyInjection } from ".";
import { RegisterUserController } from "../../interfaceAdapters/controllers/auth/register.controller";
import { SendOtpEmailController } from "@/interfaceAdapters/controllers/auth/send-otp-email.controller";
import { VerifyOtpController } from "@/interfaceAdapters/controllers/auth/verify-otp.controller";
import { LoginUserController } from "../../interfaceAdapters/controllers/auth/login.controller";
import { LogoutUserController } from "../../interfaceAdapters/controllers/auth/logout.controller";
import { RefreshTokenController } from "../../interfaceAdapters/controllers/auth/refresh-token.controller";
import { BlockStatusMiddleware } from "./../../interfaceAdapters/middlewares/block-status.middleware";
import { UserController } from "@/interfaceAdapters/controllers/user.controller";

DependancyInjection.registerAll();


export const blockStatusMiddleware = container.resolve(BlockStatusMiddleware);

export const userController = container.resolve(UserController)

export const registerController = container.resolve(RegisterUserController);

export const sendOtpEmailController = container.resolve(SendOtpEmailController);

export const verifyOtpController = container.resolve(VerifyOtpController);

export const loginController = container.resolve(LoginUserController);

export const refreshTokenController = container.resolve(RefreshTokenController);

export const logoutController = container.resolve(LogoutUserController);
