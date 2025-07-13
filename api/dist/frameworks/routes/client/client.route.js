"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRoutes = void 0;
const auth_middleware_1 = require("../../../interfaceAdapters/middlewares/auth.middleware");
const resolver_1 = require("../../di/resolver");
const base_route_1 = require("../base.route");
class ClientRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
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
        router.post("/logout", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.authController.logout(req, res);
        });
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
        router.post("/refresh-token", auth_middleware_1.decodeToken, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.authController.handleTokenRefresh(req, res);
        });
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
        router.put("/:userId/profile", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.userController.updateUserProfile(req, res);
        });
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
        router.put("/update-password", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.userController.changePassword(req, res);
        });
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
        router.get("/getallcategory", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.categoryController.getAllCategories(req, res);
        });
        router.post("/:userId/workout-plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.dietWorkoutController.generateWork(req, res);
        });
        router.post("/:userId/diet-plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.dietWorkoutController.generateDiet(req, res);
        });
        router.get("/:userId/workout-plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.dietWorkoutController.getWorkouts(req, res);
        });
        router.get("/:userId/diet-plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.dietWorkoutController.getDietplan(req, res);
        });
        // Get workouts by category
        router.get("/workouts/category/:categoryId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.dietWorkoutController.getWorkoutsByCategory(req, res);
        });
        // Get all workouts (paginated)
        router.get("/workouts", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.dietWorkoutController.getAllWorkouts(req, res);
        });
        router.get("/trainers", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.getAllTrainers(req, res);
        });
        router.get("/trainers/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.getTrainerProfile(req, res);
        });
        router.get("/payment/plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.paymentController.getMembershipPlans(req, res);
        });
        router.post("/payment/checkout", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.paymentController.createCheckoutSession(req, res);
        });
        router.post("/payment/webhook", (req, res) => {
            resolver_1.paymentController.handleWebhook(req, res);
        });
        // Save trainer selection preferences
        router.post("/trainer-preferences", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.saveTrainerSelectionPreferences(req, res);
        });
        // Auto-match trainer
        router.post("/auto-match-trainer", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.autoMatchTrainer(req, res);
        });
        router.get("/matched-trainers", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.getMatchedTrainers(req, res);
        });
        // Auto-match trainer
        router.post("/select-trainer", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.selectTrainer(req, res);
        });
        // Manual select trainer
        router.post("/manual-select-trainer", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.manualSelectTrainer(req, res);
        });
        router.get("/trainerslots", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.getSelectedTrainerSlots(req, res);
        });
        // Book a slot (client only)
        router.post("/book", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.bookSlot(req, res);
        });
        // Cancel a booking (client only)
        router.post("/cancel", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.cancelBooking(req, res);
        });
        router.get("/bookings", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.getUserBookings(req, res);
        });
        //chat
        router.get("/chats/history/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatHistory(req, res);
        });
        router.get("/chats/recent", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getRecentChats(req, res);
        });
        router.get("/chats/participants", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatParticipants(req, res);
        });
        router.delete("/chats/messages/:messageId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.deleteMessage(req, res);
        });
        // Create workout progress
        router.post("/progress/workout", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutProgressController.createProgress(req, res);
        });
        // Update workout progress
        router.patch("/progress/workout/:id", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutProgressController.updateProgress(req, res);
        });
        // Get user workout progress
        router.get("/progress/workout/user/:userId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutProgressController.getUserProgress(req, res);
        });
        // Get workout progress by user and workout
        router.get("/progress/workout/user/:userId/workout/:workoutId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutProgressController.getProgressByUserAndWorkout(req, res);
        });
        // Get user progress metrics
        router.get("/progress/workout/metrics/:userId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutProgressController.getUserProgressMetrics(req, res);
        });
        // Workout Video Progress Routes
        router.patch("/progress/video", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutVideoProgressController.updateVideoProgress(req, res);
        });
        router.get("/progress/video/user/:userId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutVideoProgressController.getUserVideoProgress(req, res);
        });
        //not used yet
        router.get("/progress/video/user/:userId/workout/:workoutId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.workoutVideoProgressController.getVideoProgressByUserAndWorkout(req, res);
        });
        router
            .route("/community/posts")
            .post(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.createPost(req, res);
        })
            .get(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.getPosts(req, res);
        });
        router
            .route("/community/posts/:id")
            .get(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.getPost(req, res);
        })
            .delete(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.deletePost(req, res);
        });
        router.patch("/community/posts/:id/like", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.likePost(req, res);
        });
        router.post("/community/posts/:id/report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.reportPost(req, res);
        });
        // Community Comment Routes
        router.post("/community/posts/:id/comments", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.createComment(req, res);
        });
        router.patch("/community/comments/:id/like", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.likeComment(req, res);
        });
        router.delete("/community/comments/:id", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.deleteComment(req, res);
        });
        router.post("/community/comments/:id/report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.reportComment(req, res);
        });
        router.get("/community/posts/:id/comments", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.getComments(req, res);
        });
        router.post("/update-fcm-token", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.updateFCMToken(req, res);
        });
        router.patch("/notifications/:notificationId/read", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.markNotificationAsRead(req, res);
        });
        router.get("/notifications", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.getUserNotifications(req, res);
        });
        router.post("/video-call/start/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.startVideoCall(req, res);
        });
        router.post("/video-call/join/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.joinVideoCall(req, res);
        });
        router.get("/video-call/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.getVideoCallDetails(req, res);
        });
        router.post("/video-call/:slotId/end", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.endVideoCall(req, res);
        });
        router.get("/session-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.sessionHistoryController.getSessionHistory(req, res);
        });
        router.put("/upgrade", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.paymentController.upgradeSubscription(req, res);
        });
        // Get client profile
        router.get("/:clientId/profile", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.getClientProfile(req, res);
        });
        router.put("/submitreview", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.reviewController.submitReview(req, res);
        });
        router.get("/reviews/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.reviewController.getTrainerReviews(req, res);
        });
        router.put("/updatereview", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.reviewController.updateReview(req, res);
        });
        router.post("/backup-trainer/assign", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.assignBackupTrainer(req, res);
        });
        router.post("/backup-trainer/request", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.requestBackupTrainerChange(req, res);
        });
        router.get("/backup-trainer/getrequests", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getClientChangeRequests(req, res);
        });
        router.get("/backup-trainer/invitations", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getClientBackupInvitations(req, res);
        });
        router.get("/trainers-info", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.userController.getClientTrainerInfo(req, res);
        });
        router.get("/wallet", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.clientWalletController.getWalletDetails(req, res);
        });
        router.get("/walletbalance", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.paymentController.checkWalletBalance(req, res);
        });
    }
}
exports.ClientRoutes = ClientRoutes;
