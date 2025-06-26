"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const auth_middleware_1 = require("../../../interfaceAdapters/middlewares/auth.middleware");
const base_route_1 = require("../base.route");
const resolver_1 = require("../../di/resolver");
class AdminRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        let router = this.router;
        // logout
        router.post("/admin/logout", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.authController.logout(req, res);
        });
        router.get("/admin/users", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.userController.getAllUsers(req, res);
        });
        router.patch("/admin/user-status", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.userController.updateUserStatus(req, res);
        });
        router.post("/admin/refresh-token", auth_middleware_1.decodeToken, (req, res) => {
            resolver_1.authController.handleTokenRefresh(req, res);
        });
        router.patch("/admin/trainer-approval", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.trainerController.trainerVerification(req, res);
        });
        router
            .route("/admin/categories")
            .get(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.categoryController.getAllPaginatedCategories(req, res);
        })
            .post(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.categoryController.createNewCategory(req, res);
        });
        router
            .route("/admin/categories/:categoryId")
            .patch(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.categoryController.updateCategoryStatus(req, res);
        })
            .put(auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.categoryController.updateCategory(req, res);
        });
        router.post("/admin/workouts", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.addWorkout(req, res);
        });
        router.delete("/admin/workouts/:workoutId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.deleteWorkout(req, res);
        });
        router.patch("/admin/workouts/:workoutId/status", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.toggleWorkoutStatus(req, res);
        });
        router.put("/admin/workouts/:workoutId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.updateWorkout(req, res);
        });
        router.get("/admin/workouts", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.getAllAdminWorkouts(req, res);
        });
        router.post("/admin/workouts/:workoutId/exercises", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.addExercise(req, res);
        });
        router.put("/admin/workouts/:workoutId/exercises/:exerciseId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.updateExercise(req, res);
        });
        router.delete("/admin/workouts/:workoutId/exercises/:exerciseId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.deleteExercise(req, res);
        });
        router.get("/admin/workouts/:workoutId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.dietWorkoutController.getWorkoutById(req, res);
        });
        // Membership Plan Routes
        router.post("/admin/membership-plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.createMembershipPlan(req, res);
        });
        router.put("/admin/membership-plans/:planId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.updateMembershipPlan(req, res);
        });
        router.delete("/admin/membership-plans/:planId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.deleteMembershipPlan(req, res);
        });
        router.get("/admin/membership-plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.getMembershipPlans(req, res);
        });
        // Trainer Request Routes
        router.get("/admin/trainer-requests", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.getTrainerRequests(req, res);
        });
        router.put("/admin/trainer-request", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.updateTrainerRequest(req, res);
        });
        router.get("/admin/community/reports/posts", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.getReportedPosts(req, res);
        });
        router.get("/admin/community/reports/comments", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.getReportedComments(req, res);
        });
        router.delete("/admin/community/posts/:id", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.hardDeletePost(req, res);
        });
        router.delete("/admin/community/comments/:id", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.hardDeleteComment(req, res);
        });
        router.get("/admin/transactions", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), (req, res) => {
            resolver_1.adminController.getTransactionHistory(req, res);
        });
        router.post("/admin/update-fcm-token", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.updateFCMToken(req, res);
        });
        router.patch("/admin/notifications/:notificationId/read", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.markNotificationAsRead(req, res);
        });
        router.get("/admin/notifications", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.notificationController.getUserNotifications(req, res);
        });
        router.get("/admin/session-history", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.sessionHistoryController.getSessionHistory(req, res);
        });
        router.get("/admin/stats", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.adminDashboardController.getDashboardStats(req, res);
        });
        router.get("/admin/top-trainers", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.adminDashboardController.getTopPerformingTrainers(req, res);
        });
        router.get("/admin/popular-workouts", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.adminDashboardController.getPopularWorkouts(req, res);
        });
        router.get("/admin/user-and-session-data", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.adminDashboardController.getUserAndSessionData(req, res);
        });
        router.get("/admin/revenue-report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.adminDashboardController.exportRevenueReport(req, res);
        });
        router.get("/admin/session-report", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.adminDashboardController.exportSessionReport(req, res);
        });
        router.get("/admin/user-subscriptions", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.adminController.getUserSubscriptions(req, res);
        });
        router.post("/admin/backup-trainer/resolve-request", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.resolveChangeRequest(req, res);
        });
        router.get("/admin/backup-trainer/change-requests", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getAllChangeRequests(req, res);
        });
        router.get("/admin/backup-trainer/clients-overview", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.backupTrainerController.getClientsBackupOverview(req, res);
        });
        router.post("/admin/reassign-trainer", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["admin"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.reassignTrainer(req, res);
        });
    }
}
exports.AdminRoutes = AdminRoutes;
