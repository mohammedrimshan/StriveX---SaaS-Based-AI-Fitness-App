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
  slotController,
  chatController,
  commentController,
  postController,
  videoCallController,
  notificationController,
  sessionHistoryController,
  reviewController,
  trainerDashboardController,
  backupTrainerController,
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
      "/logout",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        authController.logout(req, res);
      }
    );

    router.put(
      "/:trainerId/profile",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        trainerController.updateTrainerProfile(req, res);
      }
    );

    router.post(
      "/refresh-token",
      decodeToken,
      (req: Request, res: Response) => {
        console.log("refreshing trainer", req.body);
        authController.handleTokenRefresh(req, res);
      }
    );

    router.get(
      "/getallcategory",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        categoryController.getAllCategories(req, res);
      }
    );

    router.put(
      "/update-password",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        trainerController.changePassword(req, res);
      }
    );

    router.post(
      "/stripe-connect",
      verifyAuth,
      authorizeRole(["trainer", "admin"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.createStripeConnectAccount(req, res);
      }
    );

    router.get(
      "/clients",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.getTrainerClients(req, res);
      }
    );

    router.get(
      "/pending-requests",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.getPendingClientRequests(req, res);
      }
    );

    router.post(
      "/client-request",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.acceptRejectClientRequest(req, res);
      }
    );

    router.post(
      "/create",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.createSlot(req, res);
      }
    );

    router.get(
      "/trainerownslots",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.getTrainerSlots(req, res);
      }
    );

    //chat
    router.get(
      "/chats/history/:trainerId",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatHistory(req, res);
      }
    );

    router.get(
      "/chats/recent",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getRecentChats(req, res);
      }
    );

    router.get(
      "/chats/participants",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatParticipants(req, res);
      }
    );

    router.delete(
      "/chats/messages/:messageId",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.deleteMessage(req, res);
      }
    );

    router
      .route("/community/posts")
      .post(
        verifyAuth,
        authorizeRole(["trainer"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.createPost(req, res);
        }
      )
      .get(
        verifyAuth,
        authorizeRole(["trainer"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.getPosts(req, res);
        }
      );

    router
      .route("/community/posts/:id")
      .get(
        verifyAuth,
        authorizeRole(["trainer"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.getPost(req, res);
        }
      )
      .delete(
        verifyAuth,
        authorizeRole(["trainer"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.deletePost(req, res);
        }
      );

    router.patch(
      "/community/posts/:id/like",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        postController.likePost(req, res);
      }
    );

    router.post(
      "/community/posts/:id/report",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        postController.reportPost(req, res);
      }
    );

    // Community Comment Routes
    router.post(
      "/community/posts/:id/comments",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.createComment(req, res);
      }
    );

    router.patch(
      "/community/comments/:id/like",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.likeComment(req, res);
      }
    );

    router.delete(
      "/community/comments/:id",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.deleteComment(req, res);
      }
    );

    router.post(
      "/community/comments/:id/report",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.reportComment(req, res);
      }
    );

    router.get(
      "/slotbooks",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.getBookedTrainerSlots(req, res);
      }
    );

    router.post(
      "/video-call/start/:slotId",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.startVideoCall(req, res);
      }
    );

    router.post(
      "/video-call/join/:slotId",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.joinVideoCall(req, res);
      }
    );

    router.get(
      "/video-call/:slotId",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.getVideoCallDetails(req, res);
      }
    );

    router.post(
      "/video-call/:slotId/end",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.endVideoCall(req, res);
      }
    );

    router.post(
      "/update-fcm-token",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.updateFCMToken(req, res);
      }
    );

    router.patch(
      "/notifications/:notificationId/read",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.markNotificationAsRead(req, res);
      }
    );

    router.get(
      "/notifications",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.getUserNotifications(req, res);
      }
    );

    router.get(
      "/session-history",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        sessionHistoryController.getSessionHistory(req, res);
      }
    );

    router.get(
      "/wallet-history",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerController.getWalletHistory(req, res);
      }
    );

    router.get(
      "/:trainerId/stats",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerDashboardController.getDashboardStats(req, res);
      }
    );

    router.get(
      "/:trainerId/upcoming-sessions",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerDashboardController.getUpcomingSessions(req, res);
      }
    );

    router.get(
      "/:trainerId/weekly-stats",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerDashboardController.getWeeklySessionStats(req, res);
      }
    );

    router.get(
      "/:trainerId/feedback",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerDashboardController.getClientFeedback(req, res);
      }
    );

    router.get(
      "/:trainerId/earnings",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerDashboardController.getEarningsReport(req, res);
      }
    );

    router.get(
      "/:trainerId/client-progress",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerDashboardController.getClientProgress(req, res);
      }
    );

    router.get(
      "/:trainerId/session-history",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        trainerDashboardController.getSessionHistory(req, res);
      }
    );

    router.get(
      "/reviews/:trainerId",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        reviewController.getTrainerReviews(req, res);
      }
    );

    router.post(
      "/backup-trainer/invitation",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.acceptRejectBackupInvitation(req, res);
      }
    );

    router.get(
      "/backup-trainer/invitation",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.getTrainerBackupInvitations(req, res);
      }
    );

    router.get(
      "/backup-trainer/clients",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.getTrainerBackupClients(req, res);
      }
    );

    router.post(
      "/cancel-slot",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.cancelTrainerSlot(req, res);
      }
    );

    router.post(
      "/slots/rule",
      verifyAuth,
      authorizeRole(["trainer"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.createSlotsFromRule(req, res);
      }
    );
  }
}
