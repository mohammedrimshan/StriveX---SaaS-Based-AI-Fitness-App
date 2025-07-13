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
  slotController,
  chatController,
  workoutVideoProgressController,
  workoutProgressController,
  postController,
  commentController,
  notificationController,
  videoCallController,
  sessionHistoryController,
  reviewController,
  backupTrainerController,
  clientWalletController,
} from "../../di/resolver";

import { BaseRoute } from "../base.route";

export class ClientRoutes extends BaseRoute {
  constructor() {
    super();
  }
  protected initializeRoutes(): void {
    let router = this.router;
    // logout

    /**
     * @swagger
     * /api/v1/pvt/_cl/logout:
     *   post:
     *     summary: Log out a client
     *     tags: [Client]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Successfully logged out
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 message:
     *                   type: string
     *                   example: Successfully logged out
     *       401:
     *         description: Unauthorized
     */
    router.post(
      "/logout",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        authController.logout(req, res);
      }
    );

    /**
     * @swagger
     * /api/v1/pvt/_cl/refresh-token:
     *   post:
     *     summary: Refresh client JWT token
     *     tags: [Client]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 description: Refresh token for generating new access token
     *     responses:
     *       200:
     *         description: New access token generated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: object
     *                   properties:
     *                     accessToken:
     *                       type: string
     *                 message:
     *                   type: string
     *                   example: Token refreshed successfully
     *       401:
     *         description: Invalid or expired refresh token
     */

    router.post(
      "/refresh-token",
      decodeToken,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        authController.handleTokenRefresh(req, res);
      }
    );

    /**
     * @swagger
     * /api/v1/pvt/_cl/{userId}/profile:
     *   put:
     *     summary: Update client profile
     *     tags: [Client]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the client
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/User'
     *                 message:
     *                   type: string
     *                   example: Profile updated successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    router.put(
      "/:userId/profile",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        userController.updateUserProfile(req, res);
      }
    );

    /**
     * @swagger
     * /api/v1/pvt/_cl/update-password:
     *   put:
     *     summary: Update client password
     *     tags: [Client]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               oldPassword:
     *                 type: string
     *                 description: Current password
     *               newPassword:
     *                 type: string
     *                 description: New password
     *     responses:
     *       200:
     *         description: Password updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 message:
     *                   type: string
     *                   example: Password updated successfully
     *       401:
     *         description: Unauthorized or incorrect old password
     */

    router.put(
      "/update-password",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        userController.changePassword(req, res);
      }
    );

    /**
     * @swagger
     * /api/v1/pvt/_cl/getallcategory:
     *   get:
     *     summary: Get all categories
     *     tags: [Client, Category]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of all categories
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Category'
     *                 message:
     *                   type: string
     *                   example: Categories retrieved successfully
     *       401:
     *         description: Unauthorized
     */
    router.get(
      "/getallcategory",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        categoryController.getAllCategories(req, res);
      }
    );

    router.post(
      "/:userId/workout-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        dietWorkoutController.generateWork(req, res);
      }
    );

    router.post(
      "/:userId/diet-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        console.log("refreshing client", req.body);
        dietWorkoutController.generateDiet(req, res);
      }
    );

    router.get(
      "/:userId/workout-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        dietWorkoutController.getWorkouts(req, res);
      }
    );

    router.get(
      "/:userId/diet-plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        dietWorkoutController.getDietplan(req, res);
      }
    );

    // Get workouts by category
    router.get(
      "/workouts/category/:categoryId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        dietWorkoutController.getWorkoutsByCategory(req, res);
      }
    );

    // Get all workouts (paginated)
    router.get(
      "/workouts",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        dietWorkoutController.getAllWorkouts(req, res);
      }
    );

    router.get(
      "/trainers",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getAllTrainers(req, res);
      }
    );

    router.get(
      "/trainers/:trainerId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getTrainerProfile(req, res);
      }
    );

    router.get(
      "/payment/plans",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        paymentController.getMembershipPlans(req, res);
      }
    );

    router.post(
      "/payment/checkout",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        paymentController.createCheckoutSession(req, res);
      }
    );

    router.post("/payment/webhook", (req: Request, res: Response) => {
      paymentController.handleWebhook(req, res);
    });

    // Save trainer selection preferences
    router.post(
      "/trainer-preferences",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.saveTrainerSelectionPreferences(req, res);
      }
    );

    // Auto-match trainer
    router.post(
      "/auto-match-trainer",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.autoMatchTrainer(req, res);
      }
    );
    router.get(
      "/matched-trainers",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getMatchedTrainers(req, res);
      }
    );

    // Auto-match trainer
    router.post(
      "/select-trainer",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.selectTrainer(req, res);
      }
    );

    // Manual select trainer
    router.post(
      "/manual-select-trainer",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.manualSelectTrainer(req, res);
      }
    );

    router.get(
      "/trainerslots",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.getSelectedTrainerSlots(req, res);
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

    router.get(
      "/bookings",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.getUserBookings(req, res);
      }
    );

    //chat
    router.get(
      "/chats/history/:trainerId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatHistory(req, res);
      }
    );

    router.get(
      "/chats/recent",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getRecentChats(req, res);
      }
    );

    router.get(
      "/chats/participants",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatParticipants(req, res);
      }
    );

    router.delete(
      "/chats/messages/:messageId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.deleteMessage(req, res);
      }
    );

    // Create workout progress
    router.post(
      "/progress/workout",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.createProgress(req, res);
      }
    );

    // Update workout progress
    router.patch(
      "/progress/workout/:id",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.updateProgress(req, res);
      }
    );

    // Get user workout progress
    router.get(
      "/progress/workout/user/:userId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.getUserProgress(req, res);
      }
    );

    // Get workout progress by user and workout
    router.get(
      "/progress/workout/user/:userId/workout/:workoutId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.getProgressByUserAndWorkout(req, res);
      }
    );

    // Get user progress metrics
    router.get(
      "/progress/workout/metrics/:userId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.getUserProgressMetrics(req, res);
      }
    );

    // Workout Video Progress Routes
    router.patch(
      "/progress/video",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutVideoProgressController.updateVideoProgress(req, res);
      }
    );

    router.get(
      "/progress/video/user/:userId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutVideoProgressController.getUserVideoProgress(req, res);
      }
    );

    //not used yet
    router.get(
      "/progress/video/user/:userId/workout/:workoutId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutVideoProgressController.getVideoProgressByUserAndWorkout(
          req,
          res
        );
      }
    );

    router
      .route("/community/posts")
      .post(
        verifyAuth,
        authorizeRole(["client"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.createPost(req, res);
        }
      )
      .get(
        verifyAuth,
        authorizeRole(["client"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.getPosts(req, res);
        }
      );

    router
      .route("/community/posts/:id")
      .get(
        verifyAuth,
        authorizeRole(["client"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.getPost(req, res);
        }
      )
      .delete(
        verifyAuth,
        authorizeRole(["client"]),
        blockStatusMiddleware.checkStatus as RequestHandler,
        (req: Request, res: Response) => {
          postController.deletePost(req, res);
        }
      );

    router.patch(
      "/community/posts/:id/like",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        postController.likePost(req, res);
      }
    );

    router.post(
      "/community/posts/:id/report",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        postController.reportPost(req, res);
      }
    );

    // Community Comment Routes
    router.post(
      "/community/posts/:id/comments",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.createComment(req, res);
      }
    );

    router.patch(
      "/community/comments/:id/like",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.likeComment(req, res);
      }
    );

    router.delete(
      "/community/comments/:id",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.deleteComment(req, res);
      }
    );

    router.post(
      "/community/comments/:id/report",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.reportComment(req, res);
      }
    );

    router.get(
      "/community/posts/:id/comments",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.getComments(req, res);
      }
    );

    router.post(
      "/update-fcm-token",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.updateFCMToken(req, res);
      }
    );

    router.patch(
      "/notifications/:notificationId/read",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.markNotificationAsRead(req, res);
      }
    );

    router.get(
      "/notifications",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.getUserNotifications(req, res);
      }
    );

    router.post(
      "/video-call/start/:slotId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.startVideoCall(req, res);
      }
    );

    router.post(
      "/video-call/join/:slotId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.joinVideoCall(req, res);
      }
    );

    router.get(
      "/video-call/:slotId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.getVideoCallDetails(req, res);
      }
    );

    router.post(
      "/video-call/:slotId/end",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.endVideoCall(req, res);
      }
    );

    router.get(
      "/session-history",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        sessionHistoryController.getSessionHistory(req, res);
      }
    );

    router.put(
      "/upgrade",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        paymentController.upgradeSubscription(req, res);
      }
    );

    // Get client profile
    router.get(
      "/:clientId/profile",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getClientProfile(req, res);
      }
    );

    router.put(
      "/submitreview",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        reviewController.submitReview(req, res);
      }
    );

    router.get(
      "/reviews/:trainerId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        reviewController.getTrainerReviews(req, res);
      }
    );

    router.put(
      "/updatereview",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        reviewController.updateReview(req, res);
      }
    );

    router.post(
      "/backup-trainer/assign",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.assignBackupTrainer(req, res);
      }
    );

    router.post(
      "/backup-trainer/request",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.requestBackupTrainerChange(req, res);
      }
    );

    router.get(
      "/backup-trainer/getrequests",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.getClientChangeRequests(req, res);
      }
    );

    router.get(
      "/backup-trainer/invitations",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        backupTrainerController.getClientBackupInvitations(req, res);
      }
    );

    router.get(
      "/trainers-info",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getClientTrainerInfo(req, res);
      }
    );

    router.get(
      "/wallet",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        clientWalletController.getWalletDetails(req, res);
      }
    );


    router.get(
      "/walletbalance",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        paymentController.checkWalletBalance(req, res);
      }
    );
  }
}
