import { Request, Response, RequestHandler } from "express";
import { verifyAuth, authorizeRole } from "@/interfaceAdapters/middlewares/auth.middleware";
import {
    blockStatusMiddleware,
    paymentController
} from "../../di/resolver";
import { BaseRoute } from "../base.route";

export class PaymentRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const router = this.router;

    // Get Active Membership Plans
    router.get(
      "/payment/plans",
      verifyAuth,
      authorizeRole(["client", "trainer", "admin"]),
      //blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        paymentController.getMembershipPlans(req, res);
      }
    );


    router.post(
      "/payment/webhook",
      (req: Request, res: Response) => {
        paymentController.handleWebhook(req, res);
      }
    );
  }
}