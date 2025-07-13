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
  notificationController,
  sessionHistoryController,
  adminDashboardController,
  backupTrainerController,
  slotController,
} from "../../di/resolver";

export class AdminRoutes extends BaseRoute {
  constructor() {
    super();
  }
  protected initializeRoutes(): void {
    let router = this.router;

    // logout
    router.post(
      "/logout",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        authController.logout(req, res);
      }
    );

    router.get(
      "/users",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        userController.getAllUsers(req, res);
      }
    );

    router.patch(
      "/user-status",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        userController.updateUserStatus(req, res);
      }
    );

    router.post(
      "/refresh-token",
      decodeToken,
      (req: Request, res: Response) => {
        authController.handleTokenRefresh(req, res);
      }
    );

    router.patch(
      "/trainer-approval",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        trainerController.trainerVerification(req, res);
      }
    );

    router
      .route("/categories")
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
      .route("/categories/:categoryId")
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
      "/workouts",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.addWorkout(req, res);
      }
    );

    router.delete(
      "/workouts/:workoutId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.deleteWorkout(req, res);
      }
    );

    router.patch(
      "/workouts/:workoutId/status",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.toggleWorkoutStatus(req, res);
      }
    );

    router.put(
      "/workouts/:workoutId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.updateWorkout(req, res);
      }
    );

    router.get(
      "/workouts",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.getAllAdminWorkouts(req, res);
      }
    );

    router.post(
      "/workouts/:workoutId/exercises",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.addExercise(req, res);
      }
    );

    router.put(
      "/workouts/:workoutId/exercises/:exerciseId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.updateExercise(req, res);
      }
    );

    router.delete(
      "/workouts/:workoutId/exercises/:exerciseId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.deleteExercise(req, res);
      }
    );

    router.get(
      "/workouts/:workoutId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        dietWorkoutController.getWorkoutById(req, res);
      }
    );

    // Membership Plan Routes
    router.post(
      "/membership-plans",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.createMembershipPlan(req, res);
      }
    );

    router.put(
      "/membership-plans/:planId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.updateMembershipPlan(req, res);
      }
    );

    router.delete(
      "/membership-plans/:planId",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.deleteMembershipPlan(req, res);
      }
    );

    router.get(
      "/membership-plans",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getMembershipPlans(req, res);
      }
    );

    // Trainer Request Routes
    router.get(
      "/trainer-requests",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getTrainerRequests(req, res);
      }
    );

    router.put(
      "/trainer-request",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.updateTrainerRequest(req, res);
      }
    );

    router.get(
      "/community/reports/posts",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getReportedPosts(req, res);
      }
    );

    router.get(
      "/community/reports/comments",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getReportedComments(req, res);
      }
    );

    router.delete(
      "/community/posts/:id",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.hardDeletePost(req, res);
      }
    );

    router.delete(
      "/community/comments/:id",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.hardDeleteComment(req, res);
      }
    );

    router.get(
      "/transactions",
      verifyAuth,
      authorizeRole(["admin"]),
      (req: Request, res: Response) => {
        adminController.getTransactionHistory(req, res);
      }
    );

    router.post(
      "/update-fcm-token",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.updateFCMToken(req, res);
      }
    );

    router.patch(
      "/notifications/:notificationId/read",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.markNotificationAsRead(req, res);
      }
    );

    router.get(
      "/notifications",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.getUserNotifications(req, res);
      }
    );

    router.get(
      "/session-history",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        sessionHistoryController.getSessionHistory(req, res);
      }
    );

    router.get(
      "/stats",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        adminDashboardController.getDashboardStats(req, res);
      }
    );

    router.get(
      "/top-trainers",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        adminDashboardController.getTopPerformingTrainers(req, res);
      }
    );

    router.get(
      "/popular-workouts",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        adminDashboardController.getPopularWorkouts(req, res);
      }
    );

    router.get(
      "/user-and-session-data",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        adminDashboardController.getUserAndSessionData(req, res);
      }
    );

    router.get(
      "/revenue-report",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        adminDashboardController.exportRevenueReport(req, res);
      }
    );

    router.get(
      "/session-report",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        adminDashboardController.exportSessionReport(req, res);
      }
    );

    router.get(
      "/user-subscriptions",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        adminController.getUserSubscriptions(req, res);
      }
    );

    router.post(
      "/backup-trainer/resolve-request",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.resolveChangeRequest(req, res);
      }
    );

    router.get(
      "/backup-trainer/change-requests",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.getAllChangeRequests(req, res);
      }
    );

    router.get(
      "/backup-trainer/clients-overview",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.getClientsBackupOverview(req, res);
      }
    );

    router.post(
      "/reassign-trainer",
      verifyAuth,
      authorizeRole(["admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.reassignTrainer(req, res);
      }
    );
  }
}
