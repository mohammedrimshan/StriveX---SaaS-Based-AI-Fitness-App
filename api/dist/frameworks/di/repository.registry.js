"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryRegistry = void 0;
const tsyringe_1 = require("tsyringe");
const client_repository_1 = require("@/interfaceAdapters/repositories/client/client.repository");
const redis_token_repository_1 = require("../../interfaceAdapters/repositories/redis/redis-token.repository");
const otp_repository_1 = require("@/interfaceAdapters/repositories/auth/otp.repository");
const refresh_token_respository_1 = require("@/interfaceAdapters/repositories/auth/refresh-token.respository");
const admin_repository_1 = require("@/interfaceAdapters/repositories/admin/admin.repository");
const trainer_repository_1 = require("@/interfaceAdapters/repositories/trainer/trainer.repository");
const category_repository_1 = require("@/interfaceAdapters/repositories/common/category.repository");
const ai_workout_plan_repository_1 = require("@/interfaceAdapters/repositories/client/ai-workout-plan.repository");
const ai_workout_plan_repository_2 = require("@/interfaceAdapters/repositories/client/ai-workout-plan.repository");
const progress_repository_1 = require("@/interfaceAdapters/repositories/workout/progress.repository");
const workout_repository_1 = require("@/interfaceAdapters/repositories/workout/workout.repository");
const membership_plan_repository_1 = require("@/interfaceAdapters/repositories/stripe/membership-plan.repository");
const payment_repository_1 = require("@/interfaceAdapters/repositories/stripe/payment.repository");
const webhook_event_repository_1 = require("@/interfaceAdapters/repositories/webhook-event.repository");
const slot_repository_1 = require("@/interfaceAdapters/repositories/slot/slot.repository");
const message_repository_1 = require("@/interfaceAdapters/repositories/chat/message.repository");
const workout_progrss_repository_1 = require("@/interfaceAdapters/repositories/progress/workout-progrss.repository");
const workout_video_progress_repository_1 = require("@/interfaceAdapters/repositories/progress/workout-video-progress.repository");
const post_repository_1 = require("@/interfaceAdapters/repositories/community/post.repository");
const comment_repository_1 = require("@/interfaceAdapters/repositories/community/comment.repository");
const notification_repository_1 = require("@/interfaceAdapters/repositories/notification/notification.repository");
const cancellation_repository_1 = require("@/interfaceAdapters/repositories/slot/cancellation.repository");
const client_progress_history_repository_1 = require("@/interfaceAdapters/repositories/progress/client-progress-history.repository");
const session_history_repository_1 = require("@/interfaceAdapters/repositories/session/session-history.repository");
const admin_dashboard_repository_1 = require("@/interfaceAdapters/repositories/admin/admin-dashboard.repository");
const review_repository_1 = require("@/interfaceAdapters/repositories/review/review.repository");
const trainer_dashboard_repository_1 = require("@/interfaceAdapters/repositories/trainer/trainer-dashboard-repository");
const trainer_earnings_repository_1 = require("@/interfaceAdapters/repositories/trainer/trainer-earnings.repository");
const client_wallet_repository_1 = require("@/interfaceAdapters/repositories/wallet/client-wallet.repository");
const wallet_transaction_repository_1 = require("@/interfaceAdapters/repositories/wallet/wallet-transaction.repository");
const backuptrainerinvitation_repository_1 = require("@/interfaceAdapters/repositories/backuptrainerinvitation/backuptrainerinvitation.repository");
const trainerchangerequest_repository_1 = require("@/interfaceAdapters/repositories/backuptrainerinvitation/trainerchangerequest.repository");
class RepositoryRegistry {
    static registerRepositories() {
        tsyringe_1.container.register("IClientRepository", {
            useClass: client_repository_1.ClientRepository,
        });
        tsyringe_1.container.register("IOtpRepository", {
            useClass: otp_repository_1.OtpRepository,
        });
        tsyringe_1.container.register("IRedisTokenRepository", {
            useClass: redis_token_repository_1.RedisTokenRepository,
        });
        tsyringe_1.container.register("IRefreshTokenRepository", {
            useClass: refresh_token_respository_1.RefreshTokenRepository,
        });
        tsyringe_1.container.register("IAdminRepository", {
            useClass: admin_repository_1.AdminRepository,
        });
        tsyringe_1.container.register("ITrainerRepository", {
            useClass: trainer_repository_1.TrainerRepository,
        });
        tsyringe_1.container.register("ICategoryRepository", {
            useClass: category_repository_1.CategoryRepository,
        });
        tsyringe_1.container.register("IAiWorkoutPlanRepository", {
            useClass: ai_workout_plan_repository_1.AiWorkoutPlanRepository,
        });
        tsyringe_1.container.register("IAiDietPlanRepository", {
            useClass: ai_workout_plan_repository_2.AiDietPlanRepository,
        });
        tsyringe_1.container.register("IProgressRepository", {
            useClass: progress_repository_1.ProgressRepository,
        });
        tsyringe_1.container.register("IWorkoutRepository", {
            useClass: workout_repository_1.WorkoutRepository,
        });
        tsyringe_1.container.register("IMembershipPlanRepository", {
            useClass: membership_plan_repository_1.MembershipPlanRepository,
        });
        tsyringe_1.container.register("IPaymentRepository", {
            useClass: payment_repository_1.PaymentRepository,
        });
        tsyringe_1.container.register("IEventRepository", {
            useClass: webhook_event_repository_1.EventRepository,
        });
        tsyringe_1.container.register("ISlotRepository", {
            useClass: slot_repository_1.SlotRepository,
        });
        tsyringe_1.container.register("IMessageRepository", {
            useClass: message_repository_1.MessageRepository,
        });
        tsyringe_1.container.register("IWorkoutProgressRepository", {
            useClass: workout_progrss_repository_1.WorkoutProgressRepository,
        });
        tsyringe_1.container.register("IWorkoutVideoProgressRepository", {
            useClass: workout_video_progress_repository_1.WorkoutVideoProgressRepository,
        });
        tsyringe_1.container.register("IPostRepository", {
            useClass: post_repository_1.PostRepository,
        });
        tsyringe_1.container.register("ICommentRepository", {
            useClass: comment_repository_1.CommentRepository,
        });
        tsyringe_1.container.register("INotificationRepository", {
            useClass: notification_repository_1.NotificationRepository,
        });
        tsyringe_1.container.register("ICancellationRepository", {
            useClass: cancellation_repository_1.CancellationRepository,
        });
        tsyringe_1.container.register("IClientProgressHistoryRepository", {
            useClass: client_progress_history_repository_1.ClientProgressHistoryRepository,
        });
        tsyringe_1.container.register("ISessionHistoryRepository", {
            useClass: session_history_repository_1.SessionHistoryRepository,
        });
        tsyringe_1.container.register("IAdminDashboardRepository", {
            useClass: admin_dashboard_repository_1.AdminDashboardRepository,
        });
        tsyringe_1.container.register("IReviewRepository", {
            useClass: review_repository_1.ReviewRepository,
        });
        tsyringe_1.container.register("ITrainerDashboardRepository", {
            useClass: trainer_dashboard_repository_1.TrainerDashboardRepository,
        });
        tsyringe_1.container.register("ITrainerEarningsRepository", {
            useClass: trainer_earnings_repository_1.TrainerEarningsRepository,
        });
        tsyringe_1.container.register("IClientWalletRepository", {
            useClass: client_wallet_repository_1.ClientWalletRepository,
        });
        tsyringe_1.container.register("IWalletTransactionRepository", {
            useClass: wallet_transaction_repository_1.WalletTransactionRepository,
        });
        tsyringe_1.container.register("IBackupTrainerInvitationRepository", {
            useClass: backuptrainerinvitation_repository_1.BackupTrainerInvitationRepository,
        });
        tsyringe_1.container.register("ITrainerChangeRequestRepository", {
            useClass: trainerchangerequest_repository_1.TrainerChangeRequestRepository,
        });
    }
}
exports.RepositoryRegistry = RepositoryRegistry;
