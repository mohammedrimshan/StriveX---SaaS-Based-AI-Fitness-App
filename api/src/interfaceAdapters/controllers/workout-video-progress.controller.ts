import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IWorkoutVideoProgressController } from "@/entities/controllerInterfaces/workout-video-progress.controller.interface";
import { IUpdateVideoProgressUseCase } from "@/entities/useCaseInterfaces/progress/update-video-progress.usecase.interface";
import { IGetUserVideoProgressUseCase } from "@/entities/useCaseInterfaces/progress/get-user-video-progress.usecase.interface";
import { IGetVideoProgressByUserAndWorkoutUseCase } from "@/entities/useCaseInterfaces/progress/get-video-progress-by-user-and-workout.usecase.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class WorkoutVideoProgressController implements IWorkoutVideoProgressController {
  constructor(
    @inject("IUpdateVideoProgressUseCase") private updateVideoProgressUseCase: IUpdateVideoProgressUseCase,
    @inject("IGetUserVideoProgressUseCase") private getUserVideoProgressUseCase: IGetUserVideoProgressUseCase,
    @inject("IGetVideoProgressByUserAndWorkoutUseCase")
    private getVideoProgressByUserAndWorkoutUseCase: IGetVideoProgressByUserAndWorkoutUseCase
  ) {}

  async updateVideoProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId, workoutId, videoProgress, exerciseId, status, completedExercises } = req.body;
      
      const progress = await this.updateVideoProgressUseCase.execute(
        userId,
        workoutId,
        videoProgress,
        status, 
        completedExercises,
        exerciseId 
      );
  
      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: progress,
        message: "Video progress updated successfully",
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }

  async getUserVideoProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { skip = "0", limit = "10" } = req.query;

      const result = await this.getUserVideoProgressUseCase.execute(
        userId,
        parseInt(skip as string, 10),
        parseInt(limit as string, 10)
      );

      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: result,
        message: "User video progress retrieved successfully",
      });
    } catch (error) {
        handleErrorResponse(req,res, error);
    }
  }

  async getVideoProgressByUserAndWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { userId, workoutId } = req.params;

      const progress = await this.getVideoProgressByUserAndWorkoutUseCase.execute(userId, workoutId);

      res.status(HTTP_STATUS.OK).json({
        status: "success",
        data: progress,
        message: progress ? "Video progress retrieved successfully" : "No progress found",
      });
    } catch (error) {
        handleErrorResponse(req,res, error);
    }
  }
}