// D:\StriveX\api\src\interfaceAdapters\controllers\diet-workout\diet-workout.controller.ts
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IDietWorkoutController } from "@/entities/controllerInterfaces/workout-controller.interface";
import { IAddWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/add-workout-usecase.interface";
import { IDeleteWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/delete-workout-usecase.interface";
import { IToggleWorkoutStatusUseCase } from "@/entities/useCaseInterfaces/workout/toggle-workout-usecase.interface";
import { IUpdateWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/update-workout-usecase.interface";
import { IGetAllAdminWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-all-workouts-usecase.interface";
import { IGenerateWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-workout-plans.usecase.interface";
import { IGetWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/get-workout-plans.usecase.interface";
import { IGenerateDietPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-diet-plans.usecase.interface";
import { IGetDietPlanUseCase } from "@/entities/useCaseInterfaces/users/get-diet-plans.usecase.interface";
import { IGetWorkoutsByCategoryUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-category-usecase.interface";
import { IGetWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-usecase.interface";
import { IRecordProgressUseCase } from "@/entities/useCaseInterfaces/workout/record-progress-usecase.interface";
import { IGetUserProgressUseCase } from "@/entities/useCaseInterfaces/workout/get-user-progress-usecase.interface";
// import { IGetAllNormalWorkouts } from "@/entities/useCaseInterfaces/workout/get-all-normalworkout-usecase.interface";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { Types } from "mongoose";
import { IProgressEntity } from "@/entities/models/progress.entity";

@injectable()
export class DietWorkoutController implements IDietWorkoutController {
  constructor(
    // Workout use cases from AdminController
    @inject("IAddWorkoutUseCase") private addWorkoutUseCase: IAddWorkoutUseCase,
    @inject("IDeleteWorkoutUseCase") private deleteWorkoutUseCase: IDeleteWorkoutUseCase,
    @inject("IToggleWorkoutStatusUseCase") private toggleWorkoutStatusUseCase: IToggleWorkoutStatusUseCase,
    @inject("IUpdateWorkoutUseCase") private updateWorkoutUseCase: IUpdateWorkoutUseCase,
    @inject("IGetAllAdminWorkoutsUseCase") private getAllAdminWorkoutsUseCase: IGetAllAdminWorkoutsUseCase,
    
    // Workout and Diet use cases from UserController
    @inject("IGenerateWorkoutPlanUseCase") private generateWorkoutPlanUseCase: IGenerateWorkoutPlanUseCase,
    @inject("IGetWorkoutPlanUseCase") private getWorkoutPlanUseCase: IGetWorkoutPlanUseCase,
    @inject("IGenerateDietPlanUseCase") private generateDietPlanUseCase: IGenerateDietPlanUseCase,
    @inject("IGetDietPlanUseCase") private getDietPlanUseCase: IGetDietPlanUseCase,
    @inject("IGetWorkoutsByCategoryUseCase") private getWorkoutsByCategoryUseCase: IGetWorkoutsByCategoryUseCase,
    @inject("IGetWorkoutsUseCase") private getWorkoutsUseCase: IGetWorkoutsUseCase,
    @inject("IRecordProgressUseCase") private recordProgressUseCase: IRecordProgressUseCase,
    @inject("IGetUserProgressUseCase") private getUserProgressUseCase: IGetUserProgressUseCase,
    // @inject("IGetAllNormalWorkouts") private getAllNormalWorkout: IGetAllNormalWorkouts,
  ) {}

  // From AdminController
  async addWorkout(req: Request, res: Response): Promise<void> {
    try {
      const workoutData: IWorkoutEntity = req.body;

      if (!workoutData.title || !workoutData.category || !workoutData.duration) {
        throw new CustomError("Title, category, and duration are required", HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(workoutData.exercises)) {
        throw new CustomError("Exercises must be an array", HTTP_STATUS.BAD_REQUEST);
      }
      if (!workoutData.difficulty) workoutData.difficulty = "Beginner";
      if (workoutData.isPremium === undefined) workoutData.isPremium = false;

      if (!Types.ObjectId.isValid(workoutData.category)) {
        throw new CustomError("Invalid category ID", HTTP_STATUS.BAD_REQUEST);
      }
      workoutData.category = workoutData.category.toString();

      const videos = req.body.files?.videos || [];
      if (videos.length > 0) {
        if (videos.length !== workoutData.exercises.length) {
          throw new CustomError("Number of videos must match number of exercises", HTTP_STATUS.BAD_REQUEST);
        }
      }

      const files = {
        image: req.body.files?.image,
        videos: req.body.files?.videos && Array.isArray(req.body.files.videos) ? req.body.files.videos : undefined,
      };

      const createdWorkout = await this.addWorkoutUseCase.execute(workoutData, files);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Workout created successfully",
        data: createdWorkout,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async deleteWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { workoutId } = req.params;
      if (!workoutId) throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);

      const deleted = await this.deleteWorkoutUseCase.execute(workoutId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: deleted ? "Workout deleted successfully" : "Workout not found",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async toggleWorkoutStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workoutId } = req.params;
      if (!workoutId) throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);

      const updatedWorkout = await this.toggleWorkoutStatusUseCase.execute(workoutId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Workout status updated successfully",
        data: updatedWorkout,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { workoutId } = req.params;
      const workoutData = req.body as Partial<IWorkoutEntity>;

      if (!workoutId) throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);
      if (workoutData.exercises && !Array.isArray(workoutData.exercises)) {
        throw new CustomError("Exercises must be an array", HTTP_STATUS.BAD_REQUEST);
      }
      if (workoutData.category && !Types.ObjectId.isValid(workoutData.category)) {
        throw new CustomError("Invalid category ID", HTTP_STATUS.BAD_REQUEST);
      }

      const files = { image: req.body.image };
      const updatedWorkout = await this.updateWorkoutUseCase.execute(workoutId, workoutData, files);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Workout updated successfully",
        data: updatedWorkout,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getAllAdminWorkouts(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, filter = "{}" } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const filterObj = typeof filter === "string" ? JSON.parse(filter) : {};

      if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        throw new CustomError("Invalid page or limit parameters", HTTP_STATUS.BAD_REQUEST);
      }

      const result = await this.getAllAdminWorkoutsUseCase.execute(pageNumber, pageSize, filterObj);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  

  // From UserController
  async generateWork(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const workoutPlan = await this.generateWorkoutPlanUseCase.execute(userId);

      res.status(HTTP_STATUS.CREATED).json({
        status: "success",
        message: "Workout plan generated successfully",
        data: workoutPlan,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getWorkouts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      if (!userId) throw new CustomError("ID not provided", HTTP_STATUS.BAD_REQUEST);

      const workoutPlans = await this.getWorkoutPlanUseCase.execute(userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: workoutPlans,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getWorkoutsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        throw new CustomError("ID not provided", HTTP_STATUS.BAD_REQUEST);
      }

      const workouts = await this.getWorkoutsByCategoryUseCase.execute(categoryId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: workouts,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getAllWorkouts(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "10", filter = "{}" } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
  
      // Ensure filter is an object, even for invalid inputs
      let filterObj: Record<string, any> = {};
      if (typeof filter === "string") {
        try {
          const parsed = JSON.parse(filter);
          if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            filterObj = parsed;
          } else {
            console.warn("Filter must be an object, defaulting to {}:", filter);
          }
        } catch (e) {
          console.warn("Invalid filter JSON, defaulting to {}:", filter);
        }
      } else if (filter && typeof filter === "object" && !Array.isArray(filter)) {
        filterObj = filter as Record<string, any>;
      } else {
        console.warn("Invalid filter type, defaulting to {}:", filter);
      }
  
      const workouts = await this.getWorkoutsUseCase.execute(filterObj, pageNumber, limitNumber);
      console.log("Workouts fetched:", workouts);
  
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: workouts,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async recordProgress(req: Request, res: Response): Promise<void> {
    try {
      const progressData = req.body as Omit<IProgressEntity, '_id'>;
  
      const recordedProgress = await this.recordProgressUseCase.execute(progressData);
  
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Progress recorded successfully",
        data: recordedProgress,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new CustomError("ID not provided", HTTP_STATUS.BAD_REQUEST);
      }

      const progress = await this.getUserProgressUseCase.execute(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: progress,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async generateDiet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const dietPlan = await this.generateDietPlanUseCase.execute(userId);

      res.status(HTTP_STATUS.CREATED).json({
        status: "success",
        message: "Diet plan generated successfully",
        data: dietPlan,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getDietplan(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      if (!userId) throw new CustomError("ID not provided", HTTP_STATUS.BAD_REQUEST);

      const dietPlans = await this.getDietPlanUseCase.execute(userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: dietPlans,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}