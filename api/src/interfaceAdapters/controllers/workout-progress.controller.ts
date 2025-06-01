import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IWorkoutProgressController } from "@/entities/controllerInterfaces/workout-progress.controller.interface";
import { ICreateWorkoutProgressUseCase } from "@/entities/useCaseInterfaces/progress/create-workout-progress.usecase.interface";
import { IUpdateWorkoutProgressUseCase } from "@/entities/useCaseInterfaces/progress/update-workout-progress.usecase.interface";
import { IGetUserWorkoutProgressUseCase } from "@/entities/useCaseInterfaces/progress/get-user-workout-progress.usecase.interface";
import { IGetWorkoutProgressByUserAndWorkoutUseCase } from "@/entities/useCaseInterfaces/progress/get-workout-progress-by-user-and-workout.usecase.interface";
import { IGetUserProgressMetricsUseCase } from "@/entities/useCaseInterfaces/progress/get-user-progress-metrics.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";

@injectable()
export class WorkoutProgressController implements IWorkoutProgressController {
  constructor(
    @inject("ICreateWorkoutProgressUseCase") private createWorkoutProgressUseCase: ICreateWorkoutProgressUseCase,
    @inject("IUpdateWorkoutProgressUseCase") private updateWorkoutProgressUseCase: IUpdateWorkoutProgressUseCase,
    @inject("IGetUserWorkoutProgressUseCase") private getUserWorkoutProgressUseCase: IGetUserWorkoutProgressUseCase,
    @inject("IGetWorkoutProgressByUserAndWorkoutUseCase")
    private getWorkoutProgressByUserAndWorkoutUseCase: IGetWorkoutProgressByUserAndWorkoutUseCase,
    @inject("IGetUserProgressMetricsUseCase") private getUserProgressMetricsUseCase: IGetUserProgressMetricsUseCase
  ) {}

  async createProgress(req: Request, res: Response): Promise<void> {
  try {
    const { userId, workoutId, categoryId,duration, date, completed, caloriesBurned } = req.body;
    console.log(userId, workoutId,categoryId, duration, date, completed, caloriesBurned, "Request body in createProgress");
    console.log("createProgress received:", { userId, workoutId, categoryId ,duration, date, completed, caloriesBurned });
    const progress = await this.createWorkoutProgressUseCase.execute({
      userId,
      workoutId,
      categoryId,
      duration,
      date: date ? new Date(date) : undefined,
      caloriesBurned,
      completed: completed || false,
    });
    console.log("Progress created:", progress);
    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      data: progress,
      message: "Workout progress created successfully",
    });
  } catch (error) {
    console.error("createProgress error:", error);
    handleErrorResponse(res, error);
  }
}

  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const progress = await this.updateWorkoutProgressUseCase.execute(id, updates);

      if (!progress) {
        throw new CustomError("Progress not found", HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: progress,
        message: "Workout progress updated successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { skip = "0", limit = "10", startDate, endDate } = req.query;

      const result = await this.getUserWorkoutProgressUseCase.execute(
        userId,
        parseInt(skip as string, 10),
        parseInt(limit as string, 10),
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: result,
        message: "User workout progress retrieved successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getProgressByUserAndWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { userId, workoutId } = req.params;

      const progress = await this.getWorkoutProgressByUserAndWorkoutUseCase.execute(userId, workoutId);

      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: progress,
        message: progress ? "Workout progress retrieved successfully" : "No progress found",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getUserProgressMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      console.log(userId, "User ID in getUserProgressMetrics");
      const { startDate, endDate } = req.query;

      const metrics = await this.getUserProgressMetricsUseCase.execute(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: metrics,
        message: "User progress metrics retrieved successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}