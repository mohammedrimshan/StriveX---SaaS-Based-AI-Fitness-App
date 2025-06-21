import { container } from "tsyringe";

import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-repository.interface";
import { ClientRepository } from "@/interfaceAdapters/repositories/client/client.repository";
import { IRedisTokenRepository } from "../../entities/repositoryInterfaces/redis/redis-token-repository.interface";
import { RedisTokenRepository } from "../../interfaceAdapters/repositories/redis/redis-token.repository";
import { IOtpRepository } from "../../entities/repositoryInterfaces/auth/otp-repository.interface";
import { OtpRepository } from "@/interfaceAdapters/repositories/auth/otp.repository";
import { IRefreshTokenRepository } from "@/entities/repositoryInterfaces/auth/refresh-token-repository.interface";
import { RefreshTokenRepository } from "@/interfaceAdapters/repositories/auth/refresh-token.respository";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { AdminRepository } from "@/interfaceAdapters/repositories/admin/admin.repository";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { TrainerRepository } from "@/interfaceAdapters/repositories/trainer/trainer.repository";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { CategoryRepository } from "@/interfaceAdapters/repositories/common/category.repository";
import { IAiWorkoutPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { AiWorkoutPlanRepository } from "@/interfaceAdapters/repositories/client/ai-workout-plan.repository";
import { IAiDietPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { AiDietPlanRepository } from "@/interfaceAdapters/repositories/client/ai-workout-plan.repository";
import { IProgressRepository } from "@/entities/repositoryInterfaces/workout/progress-repository.interface";
import { ProgressRepository } from "@/interfaceAdapters/repositories/workout/progress.repository";
import { IWorkoutRepository } from "@/entities/repositoryInterfaces/workout/workout-repository.interface";
import { WorkoutRepository } from "@/interfaceAdapters/repositories/workout/workout.repository";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { MembershipPlanRepository } from "@/interfaceAdapters/repositories/stripe/membership-plan.repository";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { PaymentRepository } from "@/interfaceAdapters/repositories/stripe/payment.repository";
import { IEventRepository } from "@/entities/repositoryInterfaces/ebhook-event-repository.interface";
import { EventRepository } from "@/interfaceAdapters/repositories/webhook-event.repository";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { SlotRepository } from "@/interfaceAdapters/repositories/slot/slot.repository";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { MessageRepository } from "@/interfaceAdapters/repositories/chat/message.repository";
import { IWorkoutProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-progress.repository.interface";
import { WorkoutProgressRepository } from "@/interfaceAdapters/repositories/progress/workout-progrss.repository";
import { IWorkoutVideoProgressRepository } from "@/entities/repositoryInterfaces/progress/workout-video-progress-repository.interface";
import { WorkoutVideoProgressRepository } from "@/interfaceAdapters/repositories/progress/workout-video-progress.repository";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { PostRepository } from "@/interfaceAdapters/repositories/community/post.repository";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { CommentRepository } from "@/interfaceAdapters/repositories/community/comment.repository";
import { INotificationRepository } from "@/entities/repositoryInterfaces/notification/notification-repository.interface";
import { NotificationRepository } from "@/interfaceAdapters/repositories/notification/notification.repository";
import { ICancellationRepository } from "@/entities/repositoryInterfaces/slot/cancellation.repository.interface";
import { CancellationRepository } from "@/interfaceAdapters/repositories/slot/cancellation.repository";
import { IClientProgressHistoryRepository } from "@/entities/repositoryInterfaces/progress/client-progress-history-repository.interface";
import { ClientProgressHistoryRepository } from "@/interfaceAdapters/repositories/progress/client-progress-history.repository";
import { ISessionHistoryRepository } from "@/entities/repositoryInterfaces/session/session-history-repository.interface";
import { SessionHistoryRepository } from "@/interfaceAdapters/repositories/session/session-history.repository";
import { IAdminDashboardRepository } from "@/entities/repositoryInterfaces/admin/admin-dashboard-repository.interface";
import { AdminDashboardRepository } from "@/interfaceAdapters/repositories/admin/admin-dashboard.repository";
import { IReviewRepository } from "@/entities/repositoryInterfaces/review/review-repository.interface";
import { ReviewRepository } from "@/interfaceAdapters/repositories/review/review.repository";
import { ITrainerDashboardRepository } from "@/entities/repositoryInterfaces/trainer/trainer-dashboard-repository.interface";
import { TrainerDashboardRepository } from "@/interfaceAdapters/repositories/trainer/trainer-dashboard-repository";
import { ITrainerEarningsRepository } from "@/entities/repositoryInterfaces/trainer/trainer-earnings.repository.interface";
import { TrainerEarningsRepository } from "@/interfaceAdapters/repositories/trainer/trainer-earnings.repository";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import { ClientWalletRepository } from "@/interfaceAdapters/repositories/wallet/client-wallet.repository";
import { IWalletTransactionRepository } from "@/entities/repositoryInterfaces/wallet/wallet-transaction.repository.interface";
import { WalletTransactionRepository } from "@/interfaceAdapters/repositories/wallet/wallet-transaction.repository";
import { IBackupTrainerInvitationRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/backuptrainerinvitation.repository.interface";
import { BackupTrainerInvitationRepository } from "@/interfaceAdapters/repositories/backuptrainerinvitation/backuptrainerinvitation.repository";
import { ITrainerChangeRequestRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/trainerchangerequest.repository.interface";
import { TrainerChangeRequestRepository } from "@/interfaceAdapters/repositories/backuptrainerinvitation/trainerchangerequest.repository";

export class RepositoryRegistry {
  static registerRepositories(): void {
    container.register<IClientRepository>("IClientRepository", {
      useClass: ClientRepository,
    });

    container.register<IOtpRepository>("IOtpRepository", {
      useClass: OtpRepository,
    });

    container.register<IRedisTokenRepository>("IRedisTokenRepository", {
      useClass: RedisTokenRepository,
    });

    container.register<IRefreshTokenRepository>("IRefreshTokenRepository", {
      useClass: RefreshTokenRepository,
    });

    container.register<IAdminRepository>("IAdminRepository", {
      useClass: AdminRepository,
    });

    container.register<ITrainerRepository>("ITrainerRepository", {
      useClass: TrainerRepository,
    });

    container.register<ICategoryRepository>("ICategoryRepository", {
      useClass: CategoryRepository,
    });

    container.register<IAiWorkoutPlanRepository>("IAiWorkoutPlanRepository", {
      useClass: AiWorkoutPlanRepository,
    });

    container.register<IAiDietPlanRepository>("IAiDietPlanRepository", {
      useClass: AiDietPlanRepository,
    });

    container.register<IProgressRepository>("IProgressRepository", {
      useClass: ProgressRepository,
    });

    container.register<IWorkoutRepository>("IWorkoutRepository", {
      useClass: WorkoutRepository,
    });

    container.register<IMembershipPlanRepository>("IMembershipPlanRepository", {
      useClass: MembershipPlanRepository,
    });

    container.register<IPaymentRepository>("IPaymentRepository", {
      useClass: PaymentRepository,
    });

    container.register<IEventRepository>("IEventRepository", {
      useClass: EventRepository,
    });

    container.register<ISlotRepository>("ISlotRepository", {
      useClass: SlotRepository,
    });

    container.register<IMessageRepository>("IMessageRepository", {
      useClass: MessageRepository,
    });

    container.register<IWorkoutProgressRepository>(
      "IWorkoutProgressRepository",
      {
        useClass: WorkoutProgressRepository,
      }
    );

    container.register<IWorkoutVideoProgressRepository>(
      "IWorkoutVideoProgressRepository",
      {
        useClass: WorkoutVideoProgressRepository,
      }
    );

    container.register<IPostRepository>("IPostRepository", {
      useClass: PostRepository,
    });

    container.register<ICommentRepository>("ICommentRepository", {
      useClass: CommentRepository,
    });

    container.register<INotificationRepository>("INotificationRepository", {
      useClass: NotificationRepository,
    });

    container.register<ICancellationRepository>("ICancellationRepository", {
      useClass: CancellationRepository,
    });

    container.register<IClientProgressHistoryRepository>(
      "IClientProgressHistoryRepository",
      {
        useClass: ClientProgressHistoryRepository,
      }
    );

    container.register<ISessionHistoryRepository>("ISessionHistoryRepository", {
      useClass: SessionHistoryRepository,
    });

    container.register<IAdminDashboardRepository>("IAdminDashboardRepository", {
      useClass: AdminDashboardRepository,
    });

    container.register<IReviewRepository>("IReviewRepository", {
      useClass: ReviewRepository,
    });


    container.register<ITrainerDashboardRepository>("ITrainerDashboardRepository", {
      useClass: TrainerDashboardRepository,
    });

    container.register<ITrainerEarningsRepository>("ITrainerEarningsRepository", {
      useClass: TrainerEarningsRepository,
    });

    container.register<IClientWalletRepository>("IClientWalletRepository", {
      useClass: ClientWalletRepository,
    });

    container.register<IWalletTransactionRepository>("IWalletTransactionRepository", {
      useClass: WalletTransactionRepository,
    });


    container.register<IBackupTrainerInvitationRepository>(
      "IBackupTrainerInvitationRepository",
      {
        useClass: BackupTrainerInvitationRepository,
      }
    );

    container.register<ITrainerChangeRequestRepository>(
      "ITrainerChangeRequestRepository",
      {
        useClass: TrainerChangeRequestRepository,
      }
    );
  }
}
