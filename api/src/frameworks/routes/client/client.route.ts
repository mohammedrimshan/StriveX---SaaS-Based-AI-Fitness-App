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
  categoryController,
  dietWorkoutController,
  paymentController,
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
        categoryController.getAllCategories(req, res);
      }
    );

    router.post(
      "/client/:userId/workout-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        dietWorkoutController.generateWork(req, res);
      }
    );

    router.post(
      "/client/:userId/diet-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        dietWorkoutController.generateDiet(req, res);
      }
    );

    router.get(
      "/client/:userId/workout-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        dietWorkoutController.getWorkouts(req, res);
      }
    );

    router.get(
      "/client/:userId/diet-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        dietWorkoutController.getDietplan(req, res);
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
        dietWorkoutController.getWorkoutsByCategory(req, res);
      }
    );

    // Get all workouts (paginated)
    router.get(
      "/client/workouts",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        dietWorkoutController.getAllWorkouts(req, res);
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

    router.get(
      "/client/trainers/:trainerId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getTrainerProfile(req, res);
      }
    );

    router.get(
      "/client/payment/plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        paymentController.getMembershipPlans(req, res);
      }
    );

    router.post(
      "/client/payment/checkout",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        paymentController.createCheckoutSession(req, res);
      }
    );

    router.post(
      "/client/payment/webhook",
      (req: Request, res: Response) => {
        paymentController.handleWebhook(req, res);
      }
    );
  }
}
