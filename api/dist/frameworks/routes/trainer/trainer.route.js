"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerRoutes = void 0;
const auth_middleware_1 = require("../../../interfaceAdapters/middlewares/auth.middleware");
const resolver_1 = require("../../di/resolver");
const base_route_1 = require("../base.route");
class TrainerRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        let router = this.router;
        // logout
        router.post("/logout", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.authController.logout(req, res);
        });
        router.put("/:trainerId/profile", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.trainerController.updateTrainerProfile(req, res);
        });
        router.post("/refresh-token", auth_middleware_1.decodeToken, (req, res) => {
            console.log("refreshing trainer", req.body);
            resolver_1.authController.handleTokenRefresh(req, res);
        });
        router.get("/getallcategory", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.categoryController.getAllCategories(req, res);
        });
        router.put("/update-password", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.trainerController.changePassword(req, res);
        });
        router.post("/stripe-connect", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer", "admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.createStripeConnectAccount(req, res);
        });
        router.get("/clients", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.getTrainerClients(req, res);
        });
        router.get("/pending-requests", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.getPendingClientRequests(req, res);
        });
        router.post("/client-request", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.acceptRejectClientRequest(req, res);
        });
        router.post("/create", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.createSlot(req, res);
        });
        router.get("/trainerownslots", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.getTrainerSlots(req, res);
        });
        //chat
        router.get("/chats/history/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatHistory(req, res);
        });
        router.get("/chats/recent", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getRecentChats(req, res);
        });
        router.get("/chats/participants", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatParticipants(req, res);
        });
        router.delete("/chats/messages/:messageId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.deleteMessage(req, res);
        });
        router
            .route("/community/posts")
            .post(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.createPost(req, res);
        })
            .get(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.getPosts(req, res);
        });
        router
            .route("/community/posts/:id")
            .get(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.getPost(req, res);
        })
            .delete(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.deletePost(req, res);
        });
        router.patch("/community/posts/:id/like", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.likePost(req, res);
        });
        router.post("/community/posts/:id/report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.reportPost(req, res);
        });
        // Community Comment Routes
        router.post("/community/posts/:id/comments", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.createComment(req, res);
        });
        router.patch("/community/comments/:id/like", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.likeComment(req, res);
        });
        router.delete("/community/comments/:id", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.deleteComment(req, res);
        });
        router.post("/community/comments/:id/report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.reportComment(req, res);
        });
        router.get("/slotbooks", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.getBookedTrainerSlots(req, res);
        });
        router.post("/video-call/start/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.startVideoCall(req, res);
        });
        router.post("/video-call/join/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.joinVideoCall(req, res);
        });
        router.get("/video-call/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.getVideoCallDetails(req, res);
        });
        router.post("/video-call/:slotId/end", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.endVideoCall(req, res);
        });
        router.post("/update-fcm-token", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.updateFCMToken(req, res);
        });
        router.patch("/notifications/:notificationId/read", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.markNotificationAsRead(req, res);
        });
        router.get("/notifications", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.getUserNotifications(req, res);
        });
        router.get("/session-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.sessionHistoryController.getSessionHistory(req, res);
        });
        router.get("/wallet-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.getWalletHistory(req, res);
        });
        router.get("/:trainerId/stats", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getDashboardStats(req, res);
        });
        router.get("/:trainerId/upcoming-sessions", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getUpcomingSessions(req, res);
        });
        router.get("/:trainerId/weekly-stats", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getWeeklySessionStats(req, res);
        });
        router.get("/:trainerId/feedback", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getClientFeedback(req, res);
        });
        router.get("/:trainerId/earnings", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getEarningsReport(req, res);
        });
        router.get("/:trainerId/client-progress", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getClientProgress(req, res);
        });
        router.get("/:trainerId/session-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getSessionHistory(req, res);
        });
        router.get("/reviews/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.reviewController.getTrainerReviews(req, res);
        });
        router.post("/backup-trainer/invitation", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.acceptRejectBackupInvitation(req, res);
        });
        router.get("/backup-trainer/invitation", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getTrainerBackupInvitations(req, res);
        });
        router.get("/backup-trainer/clients", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getTrainerBackupClients(req, res);
        });
        router.post("/cancel-slot", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.cancelTrainerSlot(req, res);
        });
        router.post("/slots/rule", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.createSlotsFromRule(req, res);
        });
    }
}
exports.TrainerRoutes = TrainerRoutes;
