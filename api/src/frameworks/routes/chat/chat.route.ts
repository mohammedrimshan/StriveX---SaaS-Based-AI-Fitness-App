import { Request, RequestHandler, Response } from "express";
import { BaseRoute } from "../base.route";
import {
  verifyAuth,
  authorizeRole,
} from "../../../interfaceAdapters/middlewares/auth.middleware";
import { blockStatusMiddleware, chatController } from "../../di/resolver";

export class ChatRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const router = this.router;

    router.get(
      "/history/:trainerId",
      verifyAuth,
      authorizeRole(["client", "trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatHistory(req, res);
      }
    );

   
    router.get(
      "/recent",
      verifyAuth,
      authorizeRole(["client", "trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getRecentChats(req, res);
      }
    );

   
    router.get(
      "/participants",
      verifyAuth,
      authorizeRole(["client", "trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatParticipants(req, res);
      }
    );

    
    router.delete(
      "/messages/:messageId",
      verifyAuth,
      authorizeRole(["client", "trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.deleteMessage(req, res);
      }
    );
  }
}