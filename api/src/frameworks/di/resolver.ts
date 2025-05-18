import { container } from "tsyringe";
import { DependancyInjection } from ".";
import { BlockStatusMiddleware } from "./../../interfaceAdapters/middlewares/block-status.middleware";
import { UserController } from "@/interfaceAdapters/controllers/user.controller";
import { TrainerController } from "@/interfaceAdapters/controllers/trainer.controller";
import { AuthController } from "@/interfaceAdapters/controllers/authController";
import { AdminController } from "@/interfaceAdapters/controllers/admin/admin.controller";
import { CategoryController } from "@/interfaceAdapters/controllers/category.controller";
import { DietWorkoutController } from "@/interfaceAdapters/controllers/diet-workout.controller";
import { PaymentController } from "@/interfaceAdapters/controllers/payment.controller";
import { HealthController } from "@/interfaceAdapters/controllers/health-check.controller";
import { SlotController } from "@/interfaceAdapters/controllers/slot.controller";
import { ChatController } from "@/interfaceAdapters/controllers/chat.controller";
import { WorkoutVideoProgressController } from "@/interfaceAdapters/controllers/workout-video-progress.controller";
import { WorkoutProgressController } from "@/interfaceAdapters/controllers/workout-progress.controller";
import { PostController } from "@/interfaceAdapters/controllers/post.controller";
import { CommentController } from "@/interfaceAdapters/controllers/comment.controller";
import { NotificationController } from "@/interfaceAdapters/controllers/notification.controller";
import { SlotExpiryProcessor } from "../queue/bull/slot-expiry.processor";
DependancyInjection.registerAll();

export const processor = container.resolve<SlotExpiryProcessor>("SlotExpiryProcessor");

export const blockStatusMiddleware = container.resolve(BlockStatusMiddleware);

export const userController = container.resolve(UserController);

export const trainerController = container.resolve(TrainerController);

export const authController = container.resolve(AuthController);

export const adminController = container.resolve(AdminController);

export const categoryController = container.resolve(CategoryController);

export const dietWorkoutController = container.resolve(DietWorkoutController);

export const paymentController = container.resolve(PaymentController);

export const healthController = container.resolve(HealthController);

export const slotController = container.resolve(SlotController);

export const chatController = container.resolve(ChatController);

export const workoutVideoProgressController = container.resolve(WorkoutVideoProgressController);

export const workoutProgressController = container.resolve(WorkoutProgressController);

export const postController = container.resolve(PostController);

export const commentController = container.resolve(CommentController);

export const notificationController = container.resolve(NotificationController)