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
  categoryController,
  dietWorkoutController,
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
          categoryController.getAllPaginatedCategories(req, res);
        }
      )
      .post(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          categoryController.createNewCategory(req, res);
        }
      );

    router
      .route("/admin/categories/:categoryId")
      .patch(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          categoryController.updateCategoryStatus(req, res);
        }
      )
      .put(
        verifyAuth,
        authorizeRole(["admin"]),
        (req: Request, res: Response) => {
          categoryController.updateCategory(req, res);
        }
      );

    router.post(
      "/admin/workouts",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.addWorkout(req, res);
      }
    );

    router.delete(
      "/admin/workouts/:workoutId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.deleteWorkout(req, res);
      }
    );

    router.patch(
      "/admin/workouts/:workoutId/status",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.toggleWorkoutStatus(req, res);
      }
    );

    router.put(
      "/admin/workouts/:workoutId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.updateWorkout(req, res);
      }
    );

    router.get(
      "/admin/workouts",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.getAllAdminWorkouts(req, res);
      }
    );

    router.post(
      "/admin/workouts/:workoutId/exercises",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.addExercise(req, res);
      }
    );

    router.put(
      "/admin/workouts/:workoutId/exercises/:exerciseId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.updateExercise(req, res);
      }
    );

    router.delete(
      "/admin/workouts/:workoutId/exercises/:exerciseId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.deleteExercise(req, res);
      }
    );

    router.get(
      "/admin/workouts/:workoutId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.getWorkoutById(req, res);
      }
    );

    // Membership Plan Routes
    router.post(
      "/admin/membership-plans",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.createMembershipPlan(req, res);
      }
    );

    router.put(
      "/admin/membership-plans/:planId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.updateMembershipPlan(req, res);
      }
    );

    router.delete(
      "/admin/membership-plans/:planId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.deleteMembershipPlan(req, res);
      }
    );

    router.get(
      "/admin/membership-plans",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getMembershipPlans(req, res);
      }
    );

    // Trainer Request Routes
    router.get(
      "/admin/trainer-requests",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getTrainerRequests(req, res);
      }
    );

    router.put(
      "/admin/trainer-request",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.updateTrainerRequest(req, res);
      }
    );

    router.get(
      "/admin/community/reports/posts",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getReportedPosts(req, res);
      }
    );

    router.get(
      "/admin/community/reports/comments",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getReportedComments(req, res);
      }
    );

    router.delete(
      "/admin/community/posts/:id",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.hardDeletePost(req, res);
      }
    );

    router.delete(
      "/admin/community/comments/:id",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.hardDeleteComment(req, res);
      }
    );

    router.get(
      "/admin/transactions",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getTransactionHistory(req, res);
      }
    );
  }
}
