import { Request, RequestHandler, Response } from "express";

import {
  authorizeRole,
  decodeToken,
  verifyAuth,
} from "../../../interfaceAdapters/middlewares/auth.middleware";

import { BaseRoute } from "../base.route";

import {
  blockStatusMiddleware,
  authController,
  userController,
  trainerController,
  adminController,
} from "../../di/resolver";

export class AdminRoutes extends BaseRoute {
  constructor() {
    super();
  }
  protected initializeRoutes(): void {
    let router = this.router;

    // logout
    router.post(
      "/admin/logout",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        authController.logout(req, res);
      }
    );

    router.get(
      "/admin/users",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        userController.getAllUsers(req, res);
      }
    );

    router.patch(
      "/admin/user-status",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        userController.updateUserStatus(req, res);
      }
    );

    router.post(
      "/admin/refresh-token",
      decodeToken,
      (req: Request, res: Response) => {
        authController.handleTokenRefresh(req, res);
      }
    );

    router.patch(
      "/admin/trainer-approval",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        trainerController.trainerVerification(req, res);
      }
    );

    router
      .route("/admin/categories")
      .get(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.getAllPaginatedCategories(req, res);
        }
      )
      .post(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.createNewCategory(req, res);
        }
      );

    router
      .route("/admin/categories/:categoryId")
      .patch(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.updateCategoryStatus(req, res);
        }
      )
      .put(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.updateCategory(req, res);
        }
      )
      .delete(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.deleteCategory(req, res);
        }
      );

      router.post(
        "/admin/workouts",
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.addWorkout(req, res);
        }
      );
  
      router.delete(
        "/admin/workouts/:workoutId",
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.deleteWorkout(req, res);
        }
      );
  
      router.patch(
        "/admin/workouts/:workoutId/status",
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.toggleWorkoutStatus(req, res);
        }
      );
  
      router.put(
        "/admin/workouts/:workoutId",
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.updateWorkout(req, res);
        }
      );

      router.get(
        "/admin/workouts",
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          adminController.getAllAdminWorkouts(req, res);
        }
      );
  }
}
