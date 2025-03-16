import { container } from "tsyringe";
import { BlockStatusMiddleware } from "../../interfaceAdapters/middlewares/block-status.middleware";


//*===== Controller Imports ======*//
import { RegisterUserController } from "../../interfaceAdapters/controllers/auth/register.controller";
import { SendOtpEmailController } from "@/interfaceAdapters/controllers/auth/send-otp-email.controller";
import { VerifyOtpController } from "@/interfaceAdapters/controllers/auth/verify-otp.controller";
import { LoginUserController } from "../../interfaceAdapters/controllers/auth/login.controller";
import { LogoutUserController } from "../../interfaceAdapters/controllers/auth/logout.controller";
import { RefreshTokenController } from "../../interfaceAdapters/controllers/auth/refresh-token.controller";


export class ControllerRegistry{
    static registerController():void{

        container.register("BlockStatusMiddleware", {
			useClass: BlockStatusMiddleware,
		});

        container.register("RegisterUserController",{
            useClass : RegisterUserController
        })

        container.register("SendOtpEmailController", {
			useClass: SendOtpEmailController,
		});

		container.register("VerifyOtpController", {
			useClass: VerifyOtpController,
		});

        container.register("LoginUserController", {
			useClass: LoginUserController,
		});

        container.register("RefreshTokenController", {
			useClass: RefreshTokenController,
		});

		container.register("LogoutUserController", {
			useClass: LogoutUserController,
		});

    }
}