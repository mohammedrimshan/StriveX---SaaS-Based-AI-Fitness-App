import { Request, RequestHandler, Response } from "express";

import {
  authorizeRole,
  decodeToken,
  verifyAuth,
} from "../../../interfaceAdapters/middlewares/auth.middleware";
import {
  blockStatusMiddleware,
  authController,
  userController,
} from "../../di/resolver";

import { BaseRoute } from "../base.route";

export class ClientRoutes extends BaseRoute {
  constructor() {
    super();
  }
  protected initializeRoutes(): void {
    let router = this.router;
    // logout
    router.post(
      "/client/logout",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        authController.logout(req, res);
      }
    );

    router.post(
      "/client/refresh-token",
      decodeToken,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        authController.handleTokenRefresh(req, res);
      }
    );

    router.put(
      "/client/:userId/profile",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        userController.updateUserProfile(req, res);
      }
    );

    router.put(
      "/client/update-password",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        userController.changePassword(req, res);
      }
    );

    router.get(
      "/client/getallcategory",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        userController.getAllCategories(req, res);
      }
    );

    router.post(
      "/client/:userId/workout-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        userController.generateWork(req, res);
      }
    );

    router.post(
      "/client/:userId/diet-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        userController.generateDiet(req, res);
      }
    );

    router.get(
      "/client/:userId/workout-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getWorkouts(req, res);
      }
    );

    router.get(
      "/client/:userId/diet-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getDietplan(req, res);
      }
    );

    router.get(
      "/client/:userId/progress",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getUserProgress(req, res);
      }
    );

    // Get workouts by category
    router.get(
      "/client/workouts/category/:categoryId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getWorkoutsByCategory(req, res);
      }
    );

    // Get all workouts (paginated)
    router.get(
      "/client/workouts",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getAllWorkouts(req, res);
      }
    );

    // Record progress
    router.post(
      "/client/progress",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.recordProgress(req, res);
      }
    );

    router.get(
      "/client/trainers",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getAllTrainers(req, res);
      }
    );
  }
}
