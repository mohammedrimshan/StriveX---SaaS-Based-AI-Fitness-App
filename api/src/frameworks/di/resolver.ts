import { container } from "tsyringe";
import { DependancyInjection } from ".";
import { RegisterUserController } from "../../interfaceAdapters/controllers/auth/register.controller";
import { SendOtpEmailController } from "@/interfaceAdapters/controllers/auth/send-otp-email.controller";
import { VerifyOtpController } from "@/interfaceAdapters/controllers/auth/verify-otp.controller";


DependancyInjection.registerAll();
export const registerController = container.resolve(RegisterUserController);

export const sendOtpEmailController = container.resolve(SendOtpEmailController);

export const verifyOtpController = container.resolve(VerifyOtpController);