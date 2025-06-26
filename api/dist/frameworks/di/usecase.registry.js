"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseCaseRegistry = void 0;
const tsyringe_1 = require("tsyringe");
const password_bcrypt_1 = require("../../frameworks/security/password.bcrypt");
const otp_bcrypt_1 = require("../security/otp.bcrypt");
const client_register_stratergy_1 = require("../../useCases/auth/register-strategies/client-register.stratergy");
const client_login_strategy_1 = require("@/useCases/auth/login-strategies/client-login.strategy");
const admin_register_strategy_1 = require("@/useCases/auth/register-strategies/admin-register.strategy");
const admin_login_strategy_1 = require("@/useCases/auth/login-strategies/admin-login.strategy");
const trainer_register_strategy_1 = require("@/useCases/auth/register-strategies/trainer-register.strategy");
const trainer_login_strategy_1 = require("@/useCases/auth/login-strategies/trainer-login.strategy");
const otp_service_1 = require("../../interfaceAdapters/services/otp.service");
const emai_service_1 = require("../../interfaceAdapters/services/emai.service");
const user_existance_service_1 = require("../../interfaceAdapters/services/user-existance.service");
const jwt_service_1 = require("../../interfaceAdapters/services/jwt.service");
const cloudinary_service_1 = require("@/interfaceAdapters/services/cloudinary.service");
const gemini_service_1 = require("@/interfaceAdapters/services/gemini.service");
const stripe_service_1 = require("@/interfaceAdapters/services/stripe.service");
const socket_service_1 = require("@/interfaceAdapters/services/socket.service");
const chatbot_service_1 = __importDefault(require("@/interfaceAdapters/services/chatbot.service"));
const socket_notification_service_1 = require("@/interfaceAdapters/services/socket-notification.service");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const fcm_service_1 = require("@/interfaceAdapters/services/fcm.service");
const video_socket_service_1 = require("@/interfaceAdapters/services/video-socket.service");
const zego_token_service_1 = require("@/interfaceAdapters/services/zego-token.service");
const register_user_usecase_1 = require("../../useCases/auth/register-user.usecase");
const send_otp_email_usecase_1 = require("../../useCases/auth/send-otp-email.usecase");
const verify_otp_usecase_1 = require("../../useCases/auth/verify-otp.usecase");
const login_user_usecase_1 = require("../../useCases/auth/login-user.usecase");
const generate_token_usecase_1 = require("../../useCases/auth/generate-token.usecase");
const blacklist_token_usecase_1 = require("../../useCases/auth/blacklist-token.usecase");
const revoke_refresh_token_usecase_1 = require("../../useCases/auth/revoke-refresh-token.usecase");
const refresh_token_usecase_1 = require("../../useCases/auth/refresh-token.usecase");
const get_all_users_usecase_1 = require("@/useCases/user/get-all-users.usecase");
const update_user_status_usecase_1 = require("@/useCases/user/update-user-status.usecase");
const trainer_verification_usecase_1 = require("@/useCases/trainer/trainer-verification.usecase");
const google_auth_usecase_1 = require("@/useCases/auth/google-auth.usecase");
const forgot_password_usecase_1 = require("@/useCases/auth/forgot-password.usecase");
const reset_password_usecase_1 = require("@/useCases/auth/reset-password.usecase");
const update_user_profile_usecase_1 = require("@/useCases/user/update-user-profile.usecase");
const change_logged_in_user_password_usecase_1 = require("@/useCases/user/change-logged-in-user-password.usecase");
const update_trainer_profile_usecase_1 = require("@/useCases/trainer/update-trainer-profile.usecase");
const get_all_categories_usecase_1 = require("@/useCases/common/get-all-categories.usecase");
const create_new_category_usecase_1 = require("@/useCases/admin/create-new-category.usecase");
const get_all_paginated_category_usecase_1 = require("@/useCases/admin/get-all-paginated-category.usecase");
const update_category_status_usecase_1 = require("@/useCases/admin/update-category-status.usecase");
const update_category_usecase_1 = require("@/useCases/admin/update-category.usecase");
const generate_workoutplan_usecase_1 = require("@/useCases/user/generate-workoutplan.usecase");
const generate_dietplan_usecase_1 = require("@/useCases/user/generate-dietplan.usecase");
const get_workoutplan_usecase_1 = require("@/useCases/user/get-workoutplan.usecase");
const get_dietplan_usecase_1 = require("@/useCases/user/get-dietplan.usecase");
const change_logged_in_trainer_password_usecase_1 = require("@/useCases/trainer/change-logged-in-trainer-password.usecase");
const add_workout_usecase_1 = require("@/useCases/workout/add-workout.usecase");
const update_workout_usecase_1 = require("@/useCases/workout/update-workout.usecase");
const toggle_workout_status_usecase_1 = require("@/useCases/workout/toggle-workout-status.usecase");
const delete_workout_usecase_1 = require("@/useCases/workout/delete-workout.usecase");
const get_workouts_usecase_1 = require("@/useCases/workout/get-workouts.usecase");
const get_workouts_by_category_usecase_1 = require("@/useCases/workout/get-workouts-by-category.usecase");
const record_progress_usecase_1 = require("@/useCases/workout/record-progress.usecase");
const get_user_progress_usecase_1 = require("@/useCases/workout/get-user-progress.usecase");
const get_all_admin_workouts_usecase_1 = require("@/useCases/workout/get-all-admin-workouts.usecase");
const get_all_trainers_usecase_1 = require("@/useCases/user/get-all-trainers.usecase");
const get_trainer_profile_usecase_1 = require("@/useCases/user/get-trainer-profile.usecase");
const add_exercise_usecase_1 = require("@/useCases/workout/add-exercise-usecase");
const delete_exercise_usecase_1 = require("@/useCases/workout/delete-exercise.usecase");
const update_exercise_usecase_1 = require("@/useCases/workout/update-exercise-usecase");
const get_workout_by_id_usecase_1 = require("@/useCases/workout/get-workout-by-id.usecase");
const create_stripe_connect_account_usecase_1 = require("@/useCases/trainer/create-stripe-connect-account.usecase");
const create_checkout_session_usecase_1 = require("@/useCases/stripe/create-checkout-session.usecase");
const get_trainer_request_usecase_1 = require("@/useCases/admin/get-trainer-request-usecase");
const update_trainer_request_usecase_1 = require("@/useCases/admin/update-trainer-request.usecase");
const get_trainer_clients_usecase_1 = require("@/useCases/trainer/get-trainer-clients.usecase");
const automatch_trainer_usecase_1 = require("@/useCases/user/automatch-trainer-usecase");
const manual_select_trainer_usecase_1 = require("@/useCases/user/manual-select-trainer-usecase");
const save_trainer_selection_preferences_usecase_1 = require("@/useCases/user/save-trainer-selection-preferences.usecase");
const get_matched_trainer_usecase_1 = require("@/useCases/user/get-matched-trainer-usecase");
const select_trainer_matched_list_usecase_1 = require("@/useCases/user/select-trainer-matched-list.usecase");
const get_pending_request_usecase_1 = require("@/useCases/trainer/get-pending-request-usecase");
const trainer_accept_reject_request_usecase_1 = require("@/useCases/trainer/trainer-accept-reject-request.usecase");
const book_slot_usecase_1 = require("@/useCases/slot/book-slot.usecase");
const create_slot_usecase_1 = require("@/useCases/slot/create-slot.usecase");
const get_trainer_slots_usecase_1 = require("@/useCases/slot/get-trainer-slots.usecase");
const cancel_booking_usecase_1 = require("@/useCases/slot/cancel-booking.usecase");
const get_selected_trainer_slots_usecase_1 = require("@/useCases/slot/get-selected-trainer-slots.usecase");
const update_slot_status_usecase_1 = require("@/useCases/slot/update-slot-status.usecase");
const get_user_bookings_usecase_1 = require("@/useCases/slot/get-user-bookings.usecase");
const get_chat_history_usecase_1 = require("@/useCases/chat/get-chat-history.usecase");
const get_chat_participants_usecase_1 = require("@/useCases/chat/get-chat-participants.usecase");
const get_recent_chats_usecase_1 = require("@/useCases/chat/get-recent-chats.usecase");
const validate_chat_permissions_usecase_1 = require("@/useCases/chat/validate-chat-permissions.usecase");
const delete_message_usecase_1 = require("@/useCases/chat/delete-message.usecase");
const create_workout_progress_usecase_1 = require("@/useCases/progress/create-workout-progress.usecase");
const update_workout_progress_usecase_1 = require("@/useCases/progress/update-workout-progress.usecase");
const get_workout_progress_by_user_and_workout_usecase_1 = require("@/useCases/progress/get-workout-progress-by-user-and-workout.usecase");
const update_video_progress_usecase_1 = require("@/useCases/progress/update-video-progress.usecase");
const get_video_progress_by_user_and_workout_usecase_1 = require("@/useCases/progress/get-video-progress-by-user-and-workout.usecase");
const get_user_video_progress_usecase_1 = require("@/useCases/progress/get-user-video-progress.usecase");
const get_user_workout_progress_usecase_1 = require("@/useCases/progress/get-user-workout-progress.usecase");
const get_user_progress_metrics_usecase_1 = require("@/useCases/progress/get-user-progress-metrics.usecase");
const create_comment_usecase_1 = require("@/useCases/community/create-comment.usecase");
const create_post_usecase_1 = require("@/useCases/community/create-post.usecase");
const delete_comment_usecase_1 = require("@/useCases/community/delete-comment.usecase");
const delete_post_usecase_1 = require("@/useCases/community/delete-post.usecase");
const get_post_usecase_1 = require("@/useCases/community/get-post.usecase");
const get_posts_usecase_1 = require("@/useCases/community/get-posts.usecase");
const get_reported_posts_usecase_1 = require("@/useCases/community/get-reported-posts.usecase");
const get_reported_comments_usecase_1 = require("@/useCases/community/get-reported-comments.usecase");
const like_post_usecase_1 = require("@/useCases/community/like-post.usecase");
const like_comment_usecase_1 = require("@/useCases/community/like-comment.usecase");
const report_post_usecase_1 = require("@/useCases/community/report-post.usecase");
const report_comment_usecase_1 = require("@/useCases/community/report-comment.usecase");
const hard_delete_post_usecase_1 = require("@/useCases/community/hard-delete-post.usecase");
const hard_delete_comment_usecase_1 = require("@/useCases/community/hard-delete-comment.usecase");
const get_transaction_history_usecase_1 = require("@/useCases/admin/get-transaction-history.usecase");
const get_comments_usecase_1 = require("@/useCases/community/get-comments.usecase");
const get_notifications_1 = require("@/useCases/notification/get-notifications");
const update_fcm_token_usecase_1 = require("@/useCases/notification/update-fcm-token.usecase");
const start_video_call_usecase_1 = require("@/useCases/videocall/start-video-call.usecase");
const join_video_call_usecase_1 = require("@/useCases/videocall/join-video-call.usecase");
const end_video_call_usecase_1 = require("@/useCases/videocall/end-video-call.usecase");
const get_booked_slots_usecase_1 = require("@/useCases/slot/get-booked-slots.usecase");
const get_video_call_details_usecase_1 = require("@/useCases/videocall/get-video-call-details.usecase");
const get_session_history_usecase_1 = require("@/useCases/session/get-session-history.usecase");
const get_trainer_wallet_usecase_1 = require("@/useCases/trainer/get-trainer-wallet.usecase");
const handle_webhook_usecase_1 = require("@/useCases/stripe/handle-webhook.usecase");
const upgrade_subscription_usecase_1 = require("@/useCases/stripe/upgrade-subscription.usecase");
const get_client_profile_usecase_1 = require("@/useCases/user/get-client-profile.usecase");
const get_dashboard_stats_use_case_1 = require("@/useCases/admin/dashboard/get-dashboard-stats.use-case");
const get_popular_workouts_use_case_1 = require("@/useCases/admin/dashboard/get-popular-workouts.use-case");
const get_top_performing_trainers_use_case_1 = require("@/useCases/admin/dashboard/get-top-performing-trainers.use-case");
const get_user_and_session_data_use_case_1 = require("@/useCases/admin/dashboard/get-user-and-session-data.use-case");
const get_revenue_report_use_case_1 = require("@/useCases/admin/dashboard/get-revenue-report.use-case");
const get_session_report_use_case_1 = require("@/useCases/admin/dashboard/get-session-report.use-case");
const create_review_usecase_1 = require("@/useCases/review/create-review.usecase");
const update_review_usecase_1 = require("@/useCases/review/update-review.usecase");
const get_trainer_reviews_usecase_1 = require("@/useCases/review/get-trainer-reviews.usecase");
const get_dashboard_stats_usecase_1 = require("@/useCases/trainer/Dashboard/get-dashboard-stats.usecase");
const get_upcoming_sessions_usecase_1 = require("@/useCases/trainer/Dashboard/get-upcoming-sessions.usecase");
const get_weekly_session_stats_usecase_1 = require("@/useCases/trainer/Dashboard/get-weekly-session-stats.usecase");
const get_client_feedback_usecase_1 = require("@/useCases/trainer/Dashboard/get-client-feedback.usecase");
const get_earnings_report_usecase_1 = require("@/useCases/trainer/Dashboard/get-earnings-report.usecase");
const get_client_progress_usecase_1 = require("@/useCases/trainer/Dashboard/get-client-progress.usecase");
const get_session_history_usecase_2 = require("@/useCases/trainer/Dashboard/get-session-history.usecase");
const get_user_subscriptions_usecase_1 = require("@/useCases/admin/get-user-subscriptions.usecase");
const trainer_cancelation_usecase_1 = require("@/useCases/slot/trainer-cancelation-usecase");
const reassign_trainer_usecase_1 = require("@/useCases/slot/reassign-trainer.usecase");
const accept_reject_backup_invitation_usecase_1 = require("@/useCases/backuptrainer/accept-reject-backup-invitation.usecase");
const assign_backup_trainer_usecase_1 = require("@/useCases/backuptrainer/assign-backup-trainer.usecase");
const get_all_change_requests_usecase_1 = require("@/useCases/backuptrainer/get-all-change-requests.usecase");
const get_client_change_requests_usecase_1 = require("@/useCases/backuptrainer/get-client-change-requests.usecase");
const get_pending_change_requests_usecase_1 = require("@/useCases/backuptrainer/get-pending-change-requests.usecase");
const get_client_backup_invitations_usecase_1 = require("@/useCases/backuptrainer/get-client-backup-invitations.usecase");
const get_client_backup_trainer_usecase_1 = require("@/useCases/backuptrainer/get-client-backup-trainer.usecase");
const get_trainer_backup_clients_usecase_1 = require("@/useCases/backuptrainer/get-trainer-backup-clients.usecase");
const get_trainer_backup_invitations_usecase_1 = require("@/useCases/backuptrainer/get-trainer-backup-invitations.usecase");
const get_clients_backup_overview_usecase_1 = require("@/useCases/backuptrainer/get-clients-backup-overview.usecase");
const handle_expired_invitations_usecase_1 = require("@/useCases/backuptrainer/handle-expired-invitations.usecase");
const request_backup_trainer_change_usecase_1 = require("@/useCases/backuptrainer/request-backup-trainer-change.usecase");
const resolve_backup_trainer_change_request_usecase_interface_1 = require("@/useCases/backuptrainer/resolve-backup-trainer-change-request.usecase.interface");
const get_client_trainers_info_usecase_1 = require("@/useCases/user/get-client-trainers-info.usecase");
const get_client_wallet_details_usecase_1 = require("@/useCases/wallet/get-client-wallet-details.usecase");
const slot_expiry_processor_1 = require("../queue/bull/slot-expiry.processor");
const subscription_expiry_processor_1 = require("../queue/bull/subscription-expiry.processor");
const daily_unused_session_processor_1 = require("../queue/bull/daily-unused-session.processor");
class UseCaseRegistry {
    static registerUseCases() {
        //* ====== Register Bcrypts ====== *//
        tsyringe_1.container.register("IPasswordBcrypt", {
            useClass: password_bcrypt_1.PasswordBcrypt,
        });
        tsyringe_1.container.register("IOtpBcrypt", {
            useClass: otp_bcrypt_1.OtpBcrypt,
        });
        //* ====== Register Services ====== *//
        tsyringe_1.container.register("IEmailService", {
            useClass: emai_service_1.EmailService,
        });
        tsyringe_1.container.register("IOtpService", {
            useClass: otp_service_1.OtpService,
        });
        tsyringe_1.container.register("IUserExistenceService", {
            useClass: user_existance_service_1.UserExistenceService,
        });
        tsyringe_1.container.register("ITokenService", {
            useClass: jwt_service_1.JWTService,
        });
        tsyringe_1.container.register("ICloudinaryService", {
            useClass: cloudinary_service_1.CloudinaryService,
        });
        tsyringe_1.container.register("GeminiService", {
            useClass: gemini_service_1.GeminiService,
        });
        tsyringe_1.container.register("IStripeService", {
            useClass: stripe_service_1.StripeService,
        });
        tsyringe_1.container.register("SocketService", {
            useClass: socket_service_1.SocketService,
        });
        tsyringe_1.container.register("IFCMService", {
            useClass: fcm_service_1.FCMService,
        });
        tsyringe_1.container.register("INotificationSocketService", {
            useClass: (0, tsyringe_1.delay)(() => socket_notification_service_1.SocketNotificationService),
        });
        tsyringe_1.container.register("NotificationService", {
            useClass: notification_service_1.NotificationService,
        });
        tsyringe_1.container.register("VideoSocketService", {
            useClass: video_socket_service_1.VideoSocketService,
        });
        tsyringe_1.container.register("ZegoTokenService", {
            useClass: zego_token_service_1.ZegoTokenService,
        });
        tsyringe_1.container.register("ChatbotService", {
            useClass: chatbot_service_1.default,
        });
        //* ====== Register Slot Expiry Processor ====== *//
        tsyringe_1.container.register("SlotExpiryProcessor", {
            useClass: slot_expiry_processor_1.SlotExpiryProcessor,
        });
        //* ====== Register Subscription Expiry Processor ====== *//
        tsyringe_1.container.register("SubscriptionExpiryProcessor", {
            useClass: subscription_expiry_processor_1.SubscriptionExpiryProcessor,
        });
        tsyringe_1.container.register("DailyUnusedSessionProcessor", {
            useClass: daily_unused_session_processor_1.DailyUnusedSessionProcessor,
        });
        //* ====== Register Strategies ====== *//
        tsyringe_1.container.register("ClientRegisterStrategy", {
            useClass: client_register_stratergy_1.ClientRegisterStrategy,
        });
        tsyringe_1.container.register("ClientLoginStrategy", {
            useClass: client_login_strategy_1.ClientLoginStrategy,
        });
        tsyringe_1.container.register("AdminRegisterStrategy", {
            useClass: admin_register_strategy_1.AdminRegisterStrategy,
        });
        tsyringe_1.container.register("AdminLoginStrategy", {
            useClass: admin_login_strategy_1.AdminLoginStrategy,
        });
        tsyringe_1.container.register("TrainerRegisterStrategy", {
            useClass: trainer_register_strategy_1.TrainerRegisterStrategy,
        });
        tsyringe_1.container.register("TrainerLoginStrategy", {
            useClass: trainer_login_strategy_1.TrainerLoginStrategy,
        });
        //* ====== Register UseCases ====== *//
        tsyringe_1.container.register("IRegisterUserUseCase", {
            useClass: register_user_usecase_1.RegisterUserUseCase,
        });
        tsyringe_1.container.register("ISendOtpEmailUseCase", {
            useClass: send_otp_email_usecase_1.SendOtpEmailUseCase,
        });
        tsyringe_1.container.register("IVerifyOtpUseCase", {
            useClass: verify_otp_usecase_1.VerifyOtpUseCase,
        });
        tsyringe_1.container.register("ILoginUserUseCase", {
            useClass: login_user_usecase_1.LoginUserUseCase,
        });
        tsyringe_1.container.register("IGenerateTokenUseCase", {
            useClass: generate_token_usecase_1.GenerateTokenUseCase,
        });
        tsyringe_1.container.register("IBlackListTokenUseCase", {
            useClass: blacklist_token_usecase_1.BlackListTokenUseCase,
        });
        tsyringe_1.container.register("IRevokeRefreshTokenUseCase", {
            useClass: revoke_refresh_token_usecase_1.RevokeRefreshTokenUseCase,
        });
        tsyringe_1.container.register("IRefreshTokenUseCase", {
            useClass: refresh_token_usecase_1.RefreshTokenUseCase,
        });
        tsyringe_1.container.register("IGetAllUsersUseCase", {
            useClass: get_all_users_usecase_1.GetAllUsersUseCase,
        });
        tsyringe_1.container.register("IUpdateUserStatusUseCase", {
            useClass: update_user_status_usecase_1.UpdateUserStatusUseCase,
        });
        tsyringe_1.container.register("IGoogleUseCase", {
            useClass: google_auth_usecase_1.GoogleUseCase,
        });
        tsyringe_1.container.register("ITrainerVerificationUseCase", { useClass: trainer_verification_usecase_1.TrainerVerificationUseCase });
        tsyringe_1.container.register("IForgotPasswordUseCase", {
            useClass: forgot_password_usecase_1.ForgotPasswordUseCase,
        });
        tsyringe_1.container.register("IResetPasswordUseCase", {
            useClass: reset_password_usecase_1.ResetPasswordUseCase,
        });
        tsyringe_1.container.register("IUpdateUserProfileUseCase", {
            useClass: update_user_profile_usecase_1.UpdateUserProfileUseCase,
        });
        tsyringe_1.container.register("IUpdateClientPasswordUseCase", {
            useClass: change_logged_in_user_password_usecase_1.UpdateClientPasswordUseCase,
        });
        tsyringe_1.container.register("IUpdateTrainerProfileUseCase", {
            useClass: update_trainer_profile_usecase_1.UpdateTrainerProfileUseCase,
        });
        tsyringe_1.container.register("IGetAllCategoriesUseCase", {
            useClass: get_all_categories_usecase_1.GetAllCategoriesUseCase,
        });
        tsyringe_1.container.register("ICreateNewCategoryUseCase", {
            useClass: create_new_category_usecase_1.CreateNewCategoryUseCase,
        });
        tsyringe_1.container.register("IGetAllPaginatedCategoryUseCase", {
            useClass: get_all_paginated_category_usecase_1.GetAllPaginatedCategoryUseCase,
        });
        tsyringe_1.container.register("IUpdateCategoryStatusUseCase", {
            useClass: update_category_status_usecase_1.UpdateCategoryStatusUseCase,
        });
        tsyringe_1.container.register("IUpdateCategoryUseCase", {
            useClass: update_category_usecase_1.UpdateCategoryUseCase,
        });
        tsyringe_1.container.register("IGenerateWorkoutPlanUseCase", {
            useClass: generate_workoutplan_usecase_1.GenerateWorkoutPlanUseCase,
        });
        tsyringe_1.container.register("IGenerateDietPlanUseCase", {
            useClass: generate_dietplan_usecase_1.GenerateDietPlanUseCase,
        });
        tsyringe_1.container.register("IGetWorkoutPlanUseCase", {
            useClass: get_workoutplan_usecase_1.GetWorkoutPlanUseCase,
        });
        tsyringe_1.container.register("IGetDietPlanUseCase", {
            useClass: get_dietplan_usecase_1.GetDietPlanUseCase,
        });
        tsyringe_1.container.register("IUpdateTrainerPasswordUseCase", {
            useClass: change_logged_in_trainer_password_usecase_1.UpdateTrainerPasswordUseCase,
        });
        tsyringe_1.container.register("IAddWorkoutUseCase", {
            useClass: add_workout_usecase_1.AddWorkoutUseCase,
        });
        tsyringe_1.container.register("IUpdateWorkoutUseCase", {
            useClass: update_workout_usecase_1.UpdateWorkoutUseCase,
        });
        tsyringe_1.container.register("IDeleteWorkoutUseCase", {
            useClass: delete_workout_usecase_1.DeleteWorkoutUseCase,
        });
        tsyringe_1.container.register("IToggleWorkoutStatusUseCase", {
            useClass: toggle_workout_status_usecase_1.ToggleWorkoutStatusUseCase,
        });
        tsyringe_1.container.register("IGetWorkoutsUseCase", {
            useClass: get_workouts_usecase_1.GetWorkoutsUseCase,
        });
        tsyringe_1.container.register("IGetWorkoutsByCategoryUseCase", {
            useClass: get_workouts_by_category_usecase_1.GetWorkoutsByCategoryUseCase,
        });
        tsyringe_1.container.register("IRecordProgressUseCase", {
            useClass: record_progress_usecase_1.RecordProgressUseCase,
        });
        tsyringe_1.container.register("IGetUserProgressUseCase", {
            useClass: get_user_progress_usecase_1.GetUserProgressUseCase,
        });
        tsyringe_1.container.register("IGetAllAdminWorkoutsUseCase", {
            useClass: get_all_admin_workouts_usecase_1.GetAllAdminWorkoutsUseCase,
        });
        tsyringe_1.container.register("IGetAllTrainersUseCase", {
            useClass: get_all_trainers_usecase_1.GetAllTrainersUseCase,
        });
        tsyringe_1.container.register("IGetTrainerProfileUseCase", {
            useClass: get_trainer_profile_usecase_1.GetTrainerProfileUseCase,
        });
        tsyringe_1.container.register("IAddExerciseUseCase", {
            useClass: add_exercise_usecase_1.AddExerciseUseCase,
        });
        tsyringe_1.container.register("IUpdateExerciseUseCase", {
            useClass: update_exercise_usecase_1.UpdateExerciseUseCase,
        });
        tsyringe_1.container.register("IDeleteExerciseUseCase", {
            useClass: delete_exercise_usecase_1.DeleteExerciseUseCase,
        });
        tsyringe_1.container.register("IGetWorkoutByIdUseCase", {
            useClass: get_workout_by_id_usecase_1.GetWorkoutByIdUseCase,
        });
        tsyringe_1.container.register("ICreateStripeConnectAccountUseCase", {
            useClass: create_stripe_connect_account_usecase_1.CreateStripeConnectAccountUseCase,
        });
        tsyringe_1.container.register("ICreateCheckoutSessionUseCase", {
            useClass: create_checkout_session_usecase_1.CreateCheckoutSessionUseCase,
        });
        tsyringe_1.container.register("IGetTrainerRequestsUseCase", {
            useClass: get_trainer_request_usecase_1.GetTrainerRequestsUseCase,
        });
        tsyringe_1.container.register("IUpdateTrainerRequestUseCase", {
            useClass: update_trainer_request_usecase_1.UpdateTrainerRequestUseCase,
        });
        tsyringe_1.container.register("IGetTrainerClientsUseCase", {
            useClass: get_trainer_clients_usecase_1.GetTrainerClientsUseCase,
        });
        tsyringe_1.container.register("IAutoMatchTrainerUseCase", {
            useClass: automatch_trainer_usecase_1.AutoMatchTrainerUseCase,
        });
        tsyringe_1.container.register("IManualSelectTrainerUseCase", {
            useClass: manual_select_trainer_usecase_1.ManualSelectTrainerUseCase,
        });
        tsyringe_1.container.register("ISaveTrainerSelectionPreferencesUseCase", {
            useClass: save_trainer_selection_preferences_usecase_1.SaveTrainerSelectionPreferencesUseCase,
        });
        tsyringe_1.container.register("IGetMatchedTrainersUseCase", {
            useClass: get_matched_trainer_usecase_1.GetMatchedTrainersUseCase,
        });
        tsyringe_1.container.register("ISelectTrainerFromMatchedListUseCase", {
            useClass: select_trainer_matched_list_usecase_1.SelectTrainerFromMatchedListUseCase,
        });
        tsyringe_1.container.register("IGetPendingClientRequestsUseCase", {
            useClass: get_pending_request_usecase_1.GetPendingClientRequestsUseCase,
        });
        tsyringe_1.container.register("ITrainerAcceptRejectRequestUseCase", {
            useClass: trainer_accept_reject_request_usecase_1.TrainerAcceptRejectRequestUseCase,
        });
        tsyringe_1.container.register("IBookSlotUseCase", {
            useClass: book_slot_usecase_1.BookSlotUseCase,
        });
        tsyringe_1.container.register("ICreateSlotUseCase", {
            useClass: create_slot_usecase_1.CreateSlotUseCase,
        });
        tsyringe_1.container.register("ICancelBookingUseCase", {
            useClass: cancel_booking_usecase_1.CancelBookingUseCase,
        });
        tsyringe_1.container.register("IGetTrainerSlotsUseCase", {
            useClass: get_trainer_slots_usecase_1.GetTrainerSlotsUseCase,
        });
        tsyringe_1.container.register("IGetSelectedTrainerSlotsUseCase", {
            useClass: get_selected_trainer_slots_usecase_1.GetSelectedTrainerSlotsUseCase,
        });
        tsyringe_1.container.register("IToggleSlotAvailabilityUseCase", {
            useClass: update_slot_status_usecase_1.ToggleSlotAvailabilityUseCase,
        });
        tsyringe_1.container.register("IGetUserBookingsUseCase", {
            useClass: get_user_bookings_usecase_1.GetUserBookingsUseCase,
        });
        tsyringe_1.container.register("IGetChatHistoryUseCase", {
            useClass: get_chat_history_usecase_1.GetChatHistoryUseCase,
        });
        tsyringe_1.container.register("IGetChatParticipantsUseCase", {
            useClass: get_chat_participants_usecase_1.GetChatParticipantsUseCase,
        });
        tsyringe_1.container.register("IGetRecentChatsUseCase", {
            useClass: get_recent_chats_usecase_1.GetRecentChatsUseCase,
        });
        tsyringe_1.container.register("IValidateChatPermissionsUseCase", {
            useClass: validate_chat_permissions_usecase_1.ValidateChatPermissionsUseCase,
        });
        tsyringe_1.container.register("IDeleteMessageUseCase", {
            useClass: delete_message_usecase_1.DeleteMessageUseCase,
        });
        tsyringe_1.container.register("ICreateWorkoutProgressUseCase", {
            useClass: create_workout_progress_usecase_1.CreateWorkoutProgressUseCase,
        });
        tsyringe_1.container.register("IUpdateWorkoutProgressUseCase", {
            useClass: update_workout_progress_usecase_1.UpdateWorkoutProgressUseCase,
        });
        tsyringe_1.container.register("IGetWorkoutProgressByUserAndWorkoutUseCase", {
            useClass: get_workout_progress_by_user_and_workout_usecase_1.GetWorkoutProgressByUserAndWorkoutUseCase,
        });
        tsyringe_1.container.register("IUpdateVideoProgressUseCase", {
            useClass: update_video_progress_usecase_1.UpdateVideoProgressUseCase,
        });
        tsyringe_1.container.register("IGetVideoProgressByUserAndWorkoutUseCase", {
            useClass: get_video_progress_by_user_and_workout_usecase_1.GetVideoProgressByUserAndWorkoutUseCase,
        });
        tsyringe_1.container.register("IGetUserVideoProgressUseCase", {
            useClass: get_user_video_progress_usecase_1.GetUserVideoProgressUseCase,
        });
        tsyringe_1.container.register("IGetWorkoutProgressByUserAndWorkoutUseCase", {
            useClass: get_workout_progress_by_user_and_workout_usecase_1.GetWorkoutProgressByUserAndWorkoutUseCase,
        });
        tsyringe_1.container.register("IGetVideoProgressByUserAndWorkoutUseCase", {
            useClass: get_video_progress_by_user_and_workout_usecase_1.GetVideoProgressByUserAndWorkoutUseCase,
        });
        tsyringe_1.container.register("IGetUserVideoProgressUseCase", {
            useClass: get_user_video_progress_usecase_1.GetUserVideoProgressUseCase,
        });
        tsyringe_1.container.register("IGetWorkoutProgressByUserAndWorkoutUseCase", {
            useClass: get_workout_progress_by_user_and_workout_usecase_1.GetWorkoutProgressByUserAndWorkoutUseCase,
        });
        tsyringe_1.container.register("IGetUserWorkoutProgressUseCase", {
            useClass: get_user_workout_progress_usecase_1.GetUserWorkoutProgressUseCase,
        });
        tsyringe_1.container.register("IGetUserProgressMetricsUseCase", {
            useClass: get_user_progress_metrics_usecase_1.GetUserProgressMetricsUseCase,
        });
        tsyringe_1.container.register("ICreateCommentUseCase", {
            useClass: create_comment_usecase_1.CreateCommentUseCase,
        });
        tsyringe_1.container.register("ICreatePostUseCase", {
            useClass: create_post_usecase_1.CreatePostUseCase,
        });
        tsyringe_1.container.register("ICreateCommentUseCase", {
            useClass: create_comment_usecase_1.CreateCommentUseCase,
        });
        tsyringe_1.container.register("IDeleteCommentUseCase", {
            useClass: delete_comment_usecase_1.DeleteCommentUseCase,
        });
        tsyringe_1.container.register("IDeletePostUseCase", {
            useClass: delete_post_usecase_1.DeletePostUseCase,
        });
        tsyringe_1.container.register("IGetPostUseCase", {
            useClass: get_post_usecase_1.GetPostUseCase,
        });
        tsyringe_1.container.register("IGetPostsUseCase", {
            useClass: get_posts_usecase_1.GetPostsUseCase,
        });
        tsyringe_1.container.register("IGetReportedPostsUseCase", {
            useClass: get_reported_posts_usecase_1.GetReportedPostsUseCase,
        });
        tsyringe_1.container.register("IGetReportedCommentsUseCase", { useClass: get_reported_comments_usecase_1.GetReportedCommentsUseCase });
        tsyringe_1.container.register("ILikePostUseCase", {
            useClass: like_post_usecase_1.LikePostUseCase,
        });
        tsyringe_1.container.register("ILikeCommentUseCase", {
            useClass: like_comment_usecase_1.LikeCommentUseCase,
        });
        tsyringe_1.container.register("IReportPostUseCase", {
            useClass: report_post_usecase_1.ReportPostUseCase,
        });
        tsyringe_1.container.register("IReportCommentUseCase", {
            useClass: report_comment_usecase_1.ReportCommentUseCase,
        });
        tsyringe_1.container.register("IHardDeletePostUseCase", {
            useClass: hard_delete_post_usecase_1.HardDeletePostUseCase,
        });
        tsyringe_1.container.register("IHardDeleteCommentUseCase", {
            useClass: hard_delete_comment_usecase_1.HardDeleteCommentUseCase,
        });
        tsyringe_1.container.register("IGetTransactionHistoryUseCase", {
            useClass: get_transaction_history_usecase_1.GetTransactionHistoryUseCase,
        });
        tsyringe_1.container.register("IGetCommentsUseCase", {
            useClass: get_comments_usecase_1.GetCommentsUseCase,
        });
        tsyringe_1.container.register("IGetNotifications", {
            useClass: get_notifications_1.GetNotifications,
        });
        tsyringe_1.container.register("IUpdateFCMTokenUseCase", {
            useClass: update_fcm_token_usecase_1.UpdateFCMTokenUseCase,
        });
        tsyringe_1.container.register("IStartVideoCallUseCase", {
            useClass: start_video_call_usecase_1.StartVideoCallUseCase,
        });
        tsyringe_1.container.register("IJoinVideoCallUseCase", {
            useClass: join_video_call_usecase_1.JoinVideoCallUseCase,
        });
        tsyringe_1.container.register("IEndVideoCallUseCase", {
            useClass: end_video_call_usecase_1.EndVideoCallUseCase,
        });
        tsyringe_1.container.register("IGetBookedTrainerSlotsUseCase", {
            useClass: get_booked_slots_usecase_1.GetBookedTrainerSlotsUseCase,
        });
        tsyringe_1.container.register("IGetVideoCallDetailsUseCase", {
            useClass: get_video_call_details_usecase_1.GetVideoCallDetailsUseCase,
        });
        tsyringe_1.container.register("IGetSessionHistoryUseCase", {
            useClass: get_session_history_usecase_1.GetSessionHistoryUseCase,
        });
        tsyringe_1.container.register("IGetTrainerWalletUseCase", {
            useClass: get_trainer_wallet_usecase_1.GetTrainerWalletUseCase,
        });
        tsyringe_1.container.register("IHandleWebhookUseCase", {
            useClass: handle_webhook_usecase_1.HandleWebhookUseCase,
        });
        tsyringe_1.container.register("IUpgradeSubscriptionUseCase", {
            useClass: upgrade_subscription_usecase_1.UpgradeSubscriptionUseCase,
        });
        tsyringe_1.container.register("IGetClientProfileUseCase", {
            useClass: get_client_profile_usecase_1.GetClientProfileUseCase,
        });
        tsyringe_1.container.register("IGetDashboardStatsUseCase", {
            useClass: get_dashboard_stats_use_case_1.GetDashboardStatsUseCase,
        });
        tsyringe_1.container.register("IGetTopPerformingTrainersUseCase", {
            useClass: get_top_performing_trainers_use_case_1.GetTopPerformingTrainersUseCase,
        });
        tsyringe_1.container.register("IGetPopularWorkoutsUseCase", {
            useClass: get_popular_workouts_use_case_1.GetPopularWorkoutsUseCase,
        });
        tsyringe_1.container.register("IGetUserAndSessionDataUseCase", {
            useClass: get_user_and_session_data_use_case_1.GetUserAndSessionDataUseCase,
        });
        tsyringe_1.container.register("IGetRevenueReportUseCase", {
            useClass: get_revenue_report_use_case_1.GetRevenueReportUseCase,
        });
        tsyringe_1.container.register("IGetSessionReportUseCase", {
            useClass: get_session_report_use_case_1.GetSessionReportUseCase,
        });
        tsyringe_1.container.register("ICreateReviewUseCase", {
            useClass: create_review_usecase_1.CreateReviewUseCase,
        });
        tsyringe_1.container.register("IGetTrainerReviewsUseCase", {
            useClass: get_trainer_reviews_usecase_1.GetTrainerReviewsUseCase,
        });
        tsyringe_1.container.register("IUpdateReviewUseCase", {
            useClass: update_review_usecase_1.UpdateReviewUseCase,
        });
        tsyringe_1.container.register("IGetTrainerDashboardStatsUseCase", {
            useClass: get_dashboard_stats_usecase_1.GetTrainerDashboardStatsUseCase,
        });
        tsyringe_1.container.register("IGetUpcomingSessionsUseCase", {
            useClass: get_upcoming_sessions_usecase_1.GetUpcomingSessionsUseCase,
        });
        tsyringe_1.container.register("IGetWeeklySessionStatsUseCase", {
            useClass: get_weekly_session_stats_usecase_1.GetWeeklySessionStatsUseCase,
        });
        tsyringe_1.container.register("IGetClientFeedbackUseCase", {
            useClass: get_client_feedback_usecase_1.GetClientFeedbackUseCase,
        });
        tsyringe_1.container.register("IGetEarningsReportUseCase", {
            useClass: get_earnings_report_usecase_1.GetEarningsReportUseCase,
        });
        tsyringe_1.container.register("IGetClientProgressUseCase", {
            useClass: get_client_progress_usecase_1.GetClientProgressUseCase,
        });
        tsyringe_1.container.register("IGetTrainerSessionHistoryUseCase", {
            useClass: get_session_history_usecase_2.GetTrainerSessionHistoryUseCase,
        });
        tsyringe_1.container.register("IGetUserSubscriptionsUseCase", {
            useClass: get_user_subscriptions_usecase_1.GetUserSubscriptionsUseCase,
        });
        tsyringe_1.container.register("ITrainerSlotCancellationUseCase", {
            useClass: trainer_cancelation_usecase_1.TrainerSlotCancellationUseCase,
        });
        tsyringe_1.container.register("IReassignTrainerUseCase", {
            useClass: reassign_trainer_usecase_1.ReassignTrainerUseCase,
        });
        tsyringe_1.container.register("IAcceptRejectBackupInvitationUseCase", {
            useClass: accept_reject_backup_invitation_usecase_1.AcceptRejectBackupInvitationUseCase,
        });
        tsyringe_1.container.register("IAssignBackupTrainerUseCase", {
            useClass: assign_backup_trainer_usecase_1.AssignBackupTrainerUseCase,
        });
        tsyringe_1.container.register("IGetClientBackupTrainerUseCase", {
            useClass: get_client_backup_trainer_usecase_1.GetClientBackupTrainerUseCase,
        });
        tsyringe_1.container.register("IGetClientBackupInvitationsUseCase", {
            useClass: get_client_backup_invitations_usecase_1.GetClientBackupInvitationsUseCase,
        });
        tsyringe_1.container.register("IGetPendingChangeRequestsUseCase", {
            useClass: get_pending_change_requests_usecase_1.GetPendingChangeRequestsUseCase,
        });
        tsyringe_1.container.register("IGetAllChangeRequestsUseCase", {
            useClass: get_all_change_requests_usecase_1.GetAllChangeRequestsUseCase,
        });
        tsyringe_1.container.register("IGetClientChangeRequestsUseCase", {
            useClass: get_client_change_requests_usecase_1.GetClientChangeRequestsUseCase,
        });
        tsyringe_1.container.register("IGetTrainerBackupInvitationsUseCase", {
            useClass: get_trainer_backup_invitations_usecase_1.GetTrainerBackupInvitationsUseCase,
        });
        tsyringe_1.container.register("IGetTrainerBackupClientsUseCase", {
            useClass: get_trainer_backup_clients_usecase_1.GetTrainerBackupClientsUseCase,
        });
        tsyringe_1.container.register("IGetClientsBackupOverviewUseCase", {
            useClass: get_clients_backup_overview_usecase_1.GetClientsBackupOverviewUseCase,
        });
        tsyringe_1.container.register("IHandleExpiredInvitationsUseCase", {
            useClass: handle_expired_invitations_usecase_1.HandleExpiredInvitationsUseCase,
        });
        tsyringe_1.container.register("IRequestBackupTrainerChangeUseCase", {
            useClass: request_backup_trainer_change_usecase_1.RequestBackupTrainerChangeUseCase,
        });
        tsyringe_1.container.register("IResolveBackupTrainerChangeRequestUseCase", {
            useClass: resolve_backup_trainer_change_request_usecase_interface_1.ResolveBackupTrainerChangeRequestUseCase,
        });
        tsyringe_1.container.register("IGetClientTrainersInfoUseCase", {
            useClass: get_client_trainers_info_usecase_1.GetClientTrainersInfoUseCase,
        });
        tsyringe_1.container.register("IGetClientWalletDetailsUseCase", {
            useClass: get_client_wallet_details_usecase_1.GetClientWalletDetailsUseCase,
        });
    }
}
exports.UseCaseRegistry = UseCaseRegistry;
