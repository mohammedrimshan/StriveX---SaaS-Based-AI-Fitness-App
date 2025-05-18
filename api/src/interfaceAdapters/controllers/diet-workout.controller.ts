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
import { IAddExerciseUseCase } from "@/entities/useCaseInterfaces/workout/add-exercise-usecase.interface";
import { IUpdateExerciseUseCase } from "@/entities/useCaseInterfaces/workout/update-exercise-usecase.interface";
import { IDeleteExerciseUseCase } from "@/entities/useCaseInterfaces/workout/delete-exercise-usecase.interface";
import { IGetWorkoutByIdUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-id.usecase.interface";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import { IExerciseEntity, IWorkoutEntity } from "@/entities/models/workout.entity";
import { Types } from "mongoose";
import { IProgressEntity } from "@/entities/models/progress.entity";

@injectable()
export class DietWorkoutController implements IDietWorkoutController {
  constructor(
   
    @inject("IAddWorkoutUseCase") private _addWorkoutUseCase: IAddWorkoutUseCase,
    @inject("IDeleteWorkoutUseCase") private _deleteWorkoutUseCase: IDeleteWorkoutUseCase,
    @inject("IToggleWorkoutStatusUseCase") private _toggleWorkoutStatusUseCase: IToggleWorkoutStatusUseCase,
    @inject("IUpdateWorkoutUseCase") private _updateWorkoutUseCase: IUpdateWorkoutUseCase,
    @inject("IGetAllAdminWorkoutsUseCase") private _getAllAdminWorkoutsUseCase: IGetAllAdminWorkoutsUseCase,
    @inject("IGetWorkoutByIdUseCase") private _getWorkoutByIdUseCase: IGetWorkoutByIdUseCase,

    @inject("IGenerateWorkoutPlanUseCase") private _generateWorkoutPlanUseCase: IGenerateWorkoutPlanUseCase,
    @inject("IGetWorkoutPlanUseCase") private _getWorkoutPlanUseCase: IGetWorkoutPlanUseCase,
    @inject("IGenerateDietPlanUseCase") private _generateDietPlanUseCase: IGenerateDietPlanUseCase,
    @inject("IGetDietPlanUseCase") private _getDietPlanUseCase: IGetDietPlanUseCase,
    @inject("IGetWorkoutsByCategoryUseCase") private _getWorkoutsByCategoryUseCase: IGetWorkoutsByCategoryUseCase,
    @inject("IGetWorkoutsUseCase") private _getWorkoutsUseCase: IGetWorkoutsUseCase,
    @inject("IRecordProgressUseCase") private _recordProgressUseCase: IRecordProgressUseCase,
    // @inject("IGetUserProgressUseCase") private _getUserProgressUseCase: IGetUserProgressUseCase,
    @inject("IAddExerciseUseCase") private _addExerciseUseCase: IAddExerciseUseCase,
    @inject("IUpdateExerciseUseCase") private _updateExerciseUseCase: IUpdateExerciseUseCase,
    @inject("IDeleteExerciseUseCase") private _deleteExerciseUseCase: IDeleteExerciseUseCase
  ) {}

  // From AdminController
  async addWorkout(req: Request, res: Response): Promise<void> {
    try {
      const workoutData: IWorkoutEntity = req.body;
  
      // Validate required fields
      if (!workoutData.title || !workoutData.category || !workoutData.duration) {
        throw new CustomError("Title, category, and duration are required", HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(workoutData.exercises) || workoutData.exercises.length === 0) {
        throw new CustomError("At least one exercise is required", HTTP_STATUS.BAD_REQUEST);
      }
  
      // Validate each exercise
      for (const [index, exercise] of workoutData.exercises.entries()) {
        if (!exercise.name || !exercise.description || !exercise.duration || !exercise.defaultRestDuration) {
          throw new CustomError(
            `Exercise at index ${index} is missing required fields (name, description, duration, defaultRestDuration)`,
            HTTP_STATUS.BAD_REQUEST
          );
        }
        if (typeof exercise.videoUrl !== "string" || exercise.videoUrl.trim() === "") {
          throw new CustomError(
            `Exercise at index ${index} requires a valid video URL. Please provide a non-empty URL or upload a video.`,
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }
  
      // Set defaults
      if (!workoutData.difficulty) workoutData.difficulty = "Beginner";
      if (workoutData.isPremium === undefined) workoutData.isPremium = false;
  
      // Validate category ID
      if (!Types.ObjectId.isValid(workoutData.category)) {
        throw new CustomError("Invalid category ID", HTTP_STATUS.BAD_REQUEST);
      }
      workoutData.category = workoutData.category.toString();
  
      // Validate video uploads
      const videos = req.body.files?.videos && Array.isArray(req.body.files.videos) ? req.body.files.videos : [];
      if (videos.length > 0 && videos.length !== workoutData.exercises.length) {
        throw new CustomError(
          "Number of uploaded videos must match number of exercises",
          HTTP_STATUS.BAD_REQUEST
        );
      }
  
      const files = {
        image: req.body.files?.image,
        videos,
      };
  
      const createdWorkout = await this._addWorkoutUseCase.execute(workoutData, files);
  
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

      const deleted = await this._deleteWorkoutUseCase.execute(workoutId);
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

      const updatedWorkout = await this._toggleWorkoutStatusUseCase.execute(workoutId);

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
      console.log("Received payload:", req.body);
      const files = req.body.image ? { image: req.body.image } : undefined;
      const updatedWorkout = await this._updateWorkoutUseCase.execute(workoutId, workoutData, files);
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

      const result = await this._getAllAdminWorkoutsUseCase.execute(pageNumber, pageSize, filterObj);

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

      const workoutPlan = await this._generateWorkoutPlanUseCase.execute(userId);

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

      const workoutPlans = await this._getWorkoutPlanUseCase.execute(userId);
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

      const workouts = await this._getWorkoutsByCategoryUseCase.execute(categoryId);

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
  
      const workouts = await this._getWorkoutsUseCase.execute(filterObj, pageNumber, limitNumber);
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
  
      const recordedProgress = await this._recordProgressUseCase.execute(progressData);
  
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Progress recorded successfully",
        data: recordedProgress,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // async getUserProgress(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { userId } = req.params;

  //     if (!userId) {
  //       throw new CustomError("ID not provided", HTTP_STATUS.BAD_REQUEST);
  //     }

  //     const progress = await this._getUserProgressUseCase.execute(userId);

  //     res.status(HTTP_STATUS.OK).json({
  //       success: true,
  //       message: SUCCESS_MESSAGES.DATA_RETRIEVED,
  //       data: progress,
  //     });
  //   } catch (error) {
  //     handleErrorResponse(res, error);
  //   }
  // }

  async generateDiet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const dietPlan = await this._generateDietPlanUseCase.execute(userId);

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

      const dietPlans = await this._getDietPlanUseCase.execute(userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: dietPlans,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async addExercise(req: Request, res: Response): Promise<void> {
    try {

      const {workoutId} = req.params;
      const exerciseData: IExerciseEntity = req.body;

      if (!workoutId) {
        throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);
      }
      if(!Types.ObjectId.isValid(workoutId)) {
        throw new CustomError("Invalid workout ID", HTTP_STATUS.BAD_REQUEST);
      }

      if(!exerciseData.name || !exerciseData.description || !exerciseData.duration || !exerciseData.defaultRestDuration){
        throw new CustomError(
          "Exercise missing required fields (name, description, duration, defaultRestDuration)",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const updateWorkout = await this._addExerciseUseCase.execute(workoutId, exerciseData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Exercise added successfully",
        data: updateWorkout,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateExercise(req: Request, res: Response): Promise<void> {
    try { 

      const {workoutId, exerciseId} = req.params;
      const exerciseData: Partial<IExerciseEntity> = req.body;

      if(!workoutId){
        throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);
      }

      if(!exerciseId){
        throw new CustomError("Exercise ID not provided", HTTP_STATUS.BAD_REQUEST);
      }

      if(!Types.ObjectId.isValid(workoutId) || !Types.ObjectId.isValid(exerciseId)){
        throw new CustomError("Invalid workout or exercise ID", HTTP_STATUS.BAD_REQUEST);
      }
      if (Object.keys(exerciseData).length === 0) {
        throw new CustomError("No exercise data provided for update", HTTP_STATUS.BAD_REQUEST);
      }
      if (exerciseData.videoUrl && (typeof exerciseData.videoUrl !== "string" || exerciseData.videoUrl.trim() === "")) {
        throw new CustomError("Video URL must be a non-empty string if provided", HTTP_STATUS.BAD_REQUEST);
      }

      const updatedWorkout = await this._updateExerciseUseCase.execute(workoutId, exerciseId, exerciseData);

      res.status(HTTP_STATUS.OK).json({
        success: true,  
        message: "Exercise updated successfully",
        data: updatedWorkout,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async deleteExercise(req: Request, res: Response): Promise<void> {
    try {
      const { workoutId, exerciseId } = req.params;

      if (!workoutId) {
        throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);
      }
      if (!exerciseId) {
        throw new CustomError("Exercise ID not provided", HTTP_STATUS.BAD_REQUEST);
      }
      if (!Types.ObjectId.isValid(workoutId) || !Types.ObjectId.isValid(exerciseId)) {
        throw new CustomError("Invalid workout or exercise ID", HTTP_STATUS.BAD_REQUEST);
      }

      const updatedWorkout = await this._deleteExerciseUseCase.execute(workoutId, exerciseId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Exercise deleted successfully",
        data: updatedWorkout,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getWorkoutById(req: Request, res: Response): Promise<void> {
    try {
      const { workoutId } = req.params;

      if (!workoutId) {
        throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);
      }

      const workout = await this._getWorkoutByIdUseCase.execute(workoutId);

      if (!workout) {
        throw new CustomError("Workout not found", HTTP_STATUS.NOT_FOUND);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Workout retrieved successfully",
        data: workout,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}