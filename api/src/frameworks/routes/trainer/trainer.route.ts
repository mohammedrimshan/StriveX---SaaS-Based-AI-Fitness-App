import { Request, RequestHandler, Response } from "express";

import {
  authorizeRole,
  decodeToken,
  verifyAuth,
} from "../../../interfaceAdapters/middlewares/auth.middleware";
import {
  blockStatusMiddleware,
  authController,
  trainerController,
  categoryController,
} from "../../di/resolver";

import { BaseRoute } from "../base.route";

export class TrainerRoutes extends BaseRoute {
  constructor() {
    super();
  }
  protected initializeRoutes(): void {
    let router = this.router;

    // logout
    router.post(
      "/trainer/logout",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        authController.logout(req, res);
      }
    );

    router.put(
      "/trainer/:trainerId/profile",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        trainerController.updateTrainerProfile(req, res);
      }
    );

    router.post(
      "/trainer/refresh-token",
      decodeToken,
      (req: Request, res: Response) => {
        console.log("refreshing trainer", req.body);
        authController.handleTokenRefresh(req, res);
      }
    );

    router.get(
      "/trainer/getallcategory",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        categoryController.getAllCategories(req, res);
      }
    );

    router.put(
      "/trainer/update-password",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        trainerController.changePassword(req, res);
      }
    );

    router.post(
      "/trainer/stripe-connect",
      verifyAuth,
      authorizeRole(["trainer", "admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.createStripeConnectAccount(req, res);
      }
    );

    router.get(
      "/trainer/clients",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.getTrainerClients(req, res);
      }
    );

    router.get(
      "/trainer/pending-requests",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.getPendingClientRequests(req, res);
      }
    );

    router.post(
      "/trainer/client-request",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.acceptRejectClientRequest(req, res);
      }
    );
  }
}
