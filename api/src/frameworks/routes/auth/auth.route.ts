import { Request, Response } from "express";
import { BaseRoute } from "../base.route";
import {
  authController
} from "../../di/resolver";
export class AuthRoutes extends BaseRoute {
  constructor() {
    super();
  }
  protected initializeRoutes(): void {
    let router = this.router;
    router.post("/signup", (req: Request, res: Response) => {
      authController.register(req, res);
    });

    router.post("/signin", (req: Request, res: Response) => {
			authController.login(req, res);
		});
    
    router.post("/google-auth", (req: Request, res: Response) => {
			authController.authenticateWithGoogle(req, res);
		});


    router.post("/send-otp", (req: Request, res: Response) => {
      authController.sendOtpEmail(req, res);
    });

    router.post("/verify-otp", (req: Request, res: Response) => {
      authController.verifyOtp(req, res);
    });

    router.post("/forgot-password", (req: Request, res: Response) => {
			authController.forgotPassword(req, res);
		});

		router.post("/reset-password", (req: Request, res: Response) => {
			authController.resetPassword(req, res);
		});

  }
}
