import { Request, RequestHandler, Response } from "express";
import { BaseRoute } from "../base.route";
import {
  verifyAuth,
  authorizeRole,
} from "../../../interfaceAdapters/middlewares/auth.middleware";
import { blockStatusMiddleware, slotController } from "../../di/resolver";

export class SlotRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const router = this.router;
 
    // Create a new slot (trainer only)
    router.post(
      "/create",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.createSlot(req, res);
      }
    );

    // Get trainer's slots (client or trainer)
    router.get(
      "/trainer",
      verifyAuth,
      authorizeRole(["client", "trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.getTrainerSlots(req, res);
      }
    );

    // Book a slot (client only)
    router.post(
      "/book",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.bookSlot(req, res);
      }
    );

    // Cancel a booking (client only)
    router.post(
      "/cancel",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.cancelBooking(req, res);
      }
    );
  }
}