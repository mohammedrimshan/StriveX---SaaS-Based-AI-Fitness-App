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

/**
 * @swagger
 * /client/trainers:
 *   get:
 *     summary: Get all available trainers for the client
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of available trainers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trainer'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not a client
 */

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

    router.post("/client/payment/webhook", (req: Request, res: Response) => {
      paymentController.handleWebhook(req, res);
    });

    // Save trainer selection preferences
    router.post(
      "/client/trainer-preferences",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.saveTrainerSelectionPreferences(req, res);
      }
    );

    // Auto-match trainer
    router.post(
      "/client/auto-match-trainer",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.autoMatchTrainer(req, res);
      }
    );
    router.get(
      "/client/matched-trainers",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.getMatchedTrainers(req, res);
      }
    );

    // Auto-match trainer
    router.post(
      "/client/select-trainer",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.selectTrainer(req, res);
      }
    );

    // Manual select trainer
    router.post(
      "/client/manual-select-trainer",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        userController.manualSelectTrainer(req, res);
      }
    );

    router.get(
      "/client/trainerslots",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.getSelectedTrainerSlots(req, res);
      }
    );

    // Book a slot (client only)
    router.post(
      "/client/book",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.bookSlot(req, res);
      }
    );

    // Cancel a booking (client only)
    router.post(
      "/client/cancel",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.cancelBooking(req, res);
      }
    );

    router.get(
      "/client/bookings",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        slotController.getUserBookings(req, res);
      }
    );

    //chat
    router.get(
      "/client/chats/history/:trainerId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatHistory(req, res);
      }
    );

    router.get(
      "/client/chats/recent",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getRecentChats(req, res);
      }
    );

    router.get(
      "/client/chats/participants",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.getChatParticipants(req, res);
      }
    );

    router.delete(
      "/client/chats/messages/:messageId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        chatController.deleteMessage(req, res);
      }
    );

    // Create workout progress
    router.post(
      "/client/progress/workout",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.createProgress(req, res);
      }
    );

    // Update workout progress
    router.patch(
      "/client/progress/workout/:id",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.updateProgress(req, res);
      }
    );

    // Get user workout progress
    router.get(
      "/client/progress/workout/user/:userId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.getUserProgress(req, res);
      }
    );

    // Get workout progress by user and workout 
    router.get(
      "/client/progress/workout/user/:userId/workout/:workoutId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.getProgressByUserAndWorkout(req, res);
      }
    );

    // Get user progress metrics
    router.get(
      "/client/progress/workout/metrics/:userId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutProgressController.getUserProgressMetrics(req, res);
      }
    );

    // Workout Video Progress Routes
    router.patch(
      "/client/progress/video",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutVideoProgressController.updateVideoProgress(req, res);
      }
    );

    router.get(
      "/client/progress/video/user/:userId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        workoutVideoProgressController.getUserVideoProgress(req, res);
      }
    );


//not used yet
    router.get(
      "/client/progress/video/user/:userId/workout/:workoutId",
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
      .route("/client/community/posts")
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
      .route("/client/community/posts/:id")
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
      "/client/community/posts/:id/like",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        postController.likePost(req, res);
      }
    );

    router.post(
      "/client/community/posts/:id/report",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        postController.reportPost(req, res);
      }
    );

    // Community Comment Routes
    router.post(
      "/client/community/posts/:id/comments",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.createComment(req, res);
      }
    );

    router.patch(
      "/client/community/comments/:id/like",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.likeComment(req, res);
      }
    );

    router.delete(
      "/client/community/comments/:id",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.deleteComment(req, res);
      }
    );

    router.post(
      "/client/community/comments/:id/report",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.reportComment(req, res);
      }
    );

    router.get(
      "/client/community/posts/:id/comments",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        commentController.getComments(req, res);
      }
    );

    router.post(
      "/client/update-fcm-token",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.updateFCMToken(req, res);
      }
    );

    router.patch(
      "/client/notifications/:notificationId/read",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.markNotificationAsRead(req, res);
      }
    );

    router.get(
      "/client/notifications",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        notificationController.getUserNotifications(req, res);
      }
    );

    router.post(
      "/client/video-call/start/:slotId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.startVideoCall(req, res);
      }
    );

    router.post(
      "/client/video-call/join/:slotId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.joinVideoCall(req, res);
      }
    );

    router.get(
      "/client/video-call/:slotId",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.getVideoCallDetails(req, res);
      }
    );

     router.post(
      "/client/video-call/:slotId/end",
      verifyAuth,
      authorizeRole(["client"]),
      blockStatusMiddleware.checkStatus as RequestHandler,
      (req: Request, res: Response) => {
        videoCallController.endVideoCall(req, res);
      }
    );
  }
}
