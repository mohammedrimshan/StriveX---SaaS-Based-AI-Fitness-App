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
        router.post("/trainer/logout", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.authController.logout(req, res);
        });
        router.put("/trainer/:trainerId/profile", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.trainerController.updateTrainerProfile(req, res);
        });
        router.post("/trainer/refresh-token", auth_middleware_1.decodeToken, (req, res) => {
            console.log("refreshing trainer", req.body);
            resolver_1.authController.handleTokenRefresh(req, res);
        });
        router.get("/trainer/getallcategory", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.categoryController.getAllCategories(req, res);
        });
        router.put("/trainer/update-password", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            console.log("refreshing client", req.body);
            resolver_1.trainerController.changePassword(req, res);
        });
        router.post("/trainer/stripe-connect", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer", "admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.createStripeConnectAccount(req, res);
        });
        router.get("/trainer/clients", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.getTrainerClients(req, res);
        });
        router.get("/trainer/pending-requests", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.getPendingClientRequests(req, res);
        });
        router.post("/trainer/client-request", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.acceptRejectClientRequest(req, res);
        });
        router.post("/trainer/create", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.createSlot(req, res);
        });
        router.get("/trainer/trainerslots", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.getTrainerSlots(req, res);
        });
        //chat
        router.get("/trainer/chats/history/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatHistory(req, res);
        });
        router.get("/trainer/chats/recent", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getRecentChats(req, res);
        });
        router.get("/trainer/chats/participants", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatParticipants(req, res);
        });
        router.delete("/trainer/chats/messages/:messageId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.deleteMessage(req, res);
        });
        router
            .route("/trainer/community/posts")
            .post(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.createPost(req, res);
        })
            .get(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.getPosts(req, res);
        });
        router
            .route("/trainer/community/posts/:id")
            .get(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.getPost(req, res);
        })
            .delete(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.deletePost(req, res);
        });
        router.patch("/trainer/community/posts/:id/like", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.likePost(req, res);
        });
        router.post("/trainer/community/posts/:id/report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.postController.reportPost(req, res);
        });
        // Community Comment Routes
        router.post("/trainer/community/posts/:id/comments", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.createComment(req, res);
        });
        router.patch("/trainer/community/comments/:id/like", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.likeComment(req, res);
        });
        router.delete("/trainer/community/comments/:id", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.deleteComment(req, res);
        });
        router.post("/trainer/community/comments/:id/report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.commentController.reportComment(req, res);
        });
        router.get("/trainer/slotbooks", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.getBookedTrainerSlots(req, res);
        });
        router.post("/trainer/video-call/start/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.startVideoCall(req, res);
        });
        router.post("/trainer/video-call/join/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.joinVideoCall(req, res);
        });
        router.get("/trainer/video-call/:slotId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.getVideoCallDetails(req, res);
        });
        router.post("/trainer/video-call/:slotId/end", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.videoCallController.endVideoCall(req, res);
        });
        router.post("/trainer/update-fcm-token", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.updateFCMToken(req, res);
        });
        router.patch("/trainer/notifications/:notificationId/read", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.markNotificationAsRead(req, res);
        });
        router.get("/trainer/notifications", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.getUserNotifications(req, res);
        });
        router.get("/trainer/session-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.sessionHistoryController.getSessionHistory(req, res);
        });
        router.get("/trainer/wallet-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerController.getWalletHistory(req, res);
        });
        router.get("/trainer/:trainerId/stats", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getDashboardStats(req, res);
        });
        router.get("/trainer/:trainerId/upcoming-sessions", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getUpcomingSessions(req, res);
        });
        router.get("/trainer/:trainerId/weekly-stats", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getWeeklySessionStats(req, res);
        });
        router.get("/trainer/:trainerId/feedback", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getClientFeedback(req, res);
        });
        router.get("/trainer/:trainerId/earnings", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getEarningsReport(req, res);
        });
        router.get("/trainer/:trainerId/client-progress", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getClientProgress(req, res);
        });
        router.get("/trainer/:trainerId/session-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.trainerDashboardController.getSessionHistory(req, res);
        });
        router.get("/trainer/reviews/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.reviewController.getTrainerReviews(req, res);
        });
        router.post("/trainer/backup-trainer/invitation", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.acceptRejectBackupInvitation(req, res);
        });
        router.get("/trainer/backup-trainer/invitation", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getTrainerBackupInvitations(req, res);
        });
        router.get("/trainer/backup-trainer/clients", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getTrainerBackupClients(req, res);
        });
        router.post("/trainer/cancel-slot", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.cancelTrainerSlot(req, res);
        });
        router.post("/trainer/slots/rule", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.createSlotsFromRule(req, res);
        });
    }
}
exports.TrainerRoutes = TrainerRoutes;
