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

DependancyInjection.registerAll();

export const blockStatusMiddleware = container.resolve(BlockStatusMiddleware);

export const userController = container.resolve(UserController);

export const trainerController = container.resolve(TrainerController);

export const authController = container.resolve(AuthController);

export const adminController = container.resolve(AdminController);

export const categoryController = container.resolve(CategoryController);

export const dietWorkoutController = container.resolve(DietWorkoutController);

export const paymentController = container.resolve(PaymentController);

export const healthController = container.resolve(HealthController);
