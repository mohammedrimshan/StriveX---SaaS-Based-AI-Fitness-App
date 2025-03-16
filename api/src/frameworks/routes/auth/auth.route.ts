import { Request, Response } from "express";
import { BaseRoute } from "../base.route";
import {
  registerController,
  sendOtpEmailController,
  verifyOtpController,
  loginController,
} from "../../di/resolver";
export class AuthRoutes extends BaseRoute {
  constructor() {
    super();
  }
  protected initializeRoutes(): void {
    let router = this.router;
    router.post("/signup", (req: Request, res: Response) => {
      registerController.handle(req, res);
    });

    router.post("/signin", (req: Request, res: Response) => {
			loginController.handle(req, res);
		});
    
    router.post("/send-otp", (req: Request, res: Response) => {
      sendOtpEmailController.handle(req, res);
    });

    router.post("/verify-otp", (req: Request, res: Response) => {
      verifyOtpController.handle(req, res);
    });
  }
}
