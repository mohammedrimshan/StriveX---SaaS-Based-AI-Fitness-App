import { Request, Response } from "express";
import { ICreateNewCategoryUseCase } from "@/entities/useCaseInterfaces/admin/create-new-category.interface";
import { IGetAllPaginatedCategoryUseCase } from "@/entities/useCaseInterfaces/admin/get-all-paginated-category-usecase.interface";
import { IUpdateCategoryStatusUseCase } from "../../../entities/useCaseInterfaces/admin/update-category-status-usecase.interface";
import { IDeleteCategoryUseCase } from "@/entities/useCaseInterfaces/admin/delete-category-usecase.interface";
import { IUpdateCategoryUseCase } from "@/entities/useCaseInterfaces/admin/update-category-usecase.interface";
import { IAddWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/add-workout-usecase.interface";
import { IDeleteWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/delete-workout-usecase.interface";
import { IToggleWorkoutStatusUseCase } from "@/entities/useCaseInterfaces/workout/toggle-workout-usecase.interface";
import { IUpdateWorkoutUseCase } from "@/entities/useCaseInterfaces/workout/update-workout-usecase.interface";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../../../shared/constants";
import { inject, injectable } from "tsyringe";
import { IAdminController } from "@/entities/controllerInterfaces/admin-controller.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { IGetAllCategoriesUseCase } from "@/entities/useCaseInterfaces/common/get-all-category.interface";
import { IGetAllAdminWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-all-workouts-usecase.interface";
import { Types } from "mongoose";
@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject("ICreateNewCategoryUseCase")
    private createNewCategoryUseCase: ICreateNewCategoryUseCase,
    @inject("IGetAllPaginatedCategoryUseCase")
    private getAllPaginatedCategoryUseCase: IGetAllPaginatedCategoryUseCase,
    @inject("IUpdateCategoryStatusUseCase")
    private updateCategoryStatusUseCase: IUpdateCategoryStatusUseCase,
    @inject("IUpdateCategoryUseCase")
    private updateCategoryUseCase: IUpdateCategoryUseCase,
    @inject("IDeleteCategoryUseCase")
    private deleteCategoryUseCase: IDeleteCategoryUseCase,
    @inject("IAddWorkoutUseCase")
    private addWorkoutUseCase: IAddWorkoutUseCase,
    @inject("IDeleteWorkoutUseCase")
    private deleteWorkoutUseCase: IDeleteWorkoutUseCase,
    @inject("IToggleWorkoutStatusUseCase")
    private toggleWorkoutStatusUseCase: IToggleWorkoutStatusUseCase,
    @inject("IUpdateWorkoutUseCase")
    private updateWorkoutUseCase: IUpdateWorkoutUseCase,
    @inject("IGetAllCategoriesUseCase")
    private getAllCategoriesUseCase: IGetAllCategoriesUseCase,
    @inject("IGetAllAdminWorkoutsUseCase")
    private getAllAdminWorkoutsUseCase: IGetAllAdminWorkoutsUseCase,
  ) {}

  // Create a new category with name and optional description
  async createNewCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body as { name: string; description?: string };

      // Validation
      if (!name) {
        throw new CustomError("Category name is required", HTTP_STATUS.BAD_REQUEST);
      }

      await this.createNewCategoryUseCase.execute(name, description);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
      // Check if this is a duplicate category error
      if (error instanceof Error && error.message.includes("Category already exists")) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: "A category with this name already exists",
          error: "DUPLICATE_CATEGORY",
        });
        return;
      }
      
      handleErrorResponse(res, error);
    }
  }

  // Get all paginated categories
  async getAllPaginatedCategories(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, searchTerm = "" } = req.query;

      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const searchTermString = typeof searchTerm === "string" ? searchTerm : "";

      // Validation
      if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        throw new CustomError("Invalid page or limit parameters", HTTP_STATUS.BAD_REQUEST);
      }

      const { categories, total, all } = await this.getAllPaginatedCategoryUseCase.execute(
        pageNumber,
        pageSize,
        searchTermString
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        categories,
        totalPages: total,
        currentPage: pageNumber,
        totalCategory: all,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Update category status
  async updateCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;

      // Validation
      if (!categoryId) {
        throw new CustomError("Category ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      await this.updateCategoryStatusUseCase.execute(categoryId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Update category details
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const { name, description } = req.body as { name: string; description?: string };

      // Validation
      if (!categoryId) {
        throw new CustomError("Category ID is required", HTTP_STATUS.BAD_REQUEST);
      }
      if (!name) {
        throw new CustomError("Category name is required", HTTP_STATUS.BAD_REQUEST);
      }

      await this.updateCategoryUseCase.execute(categoryId, name, description);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Category already exists")) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: "A category with this name already exists",
          error: "DUPLICATE_CATEGORY",
        });
        return;
      }
      
      handleErrorResponse(res, error);
    }
  }

  // Delete a category
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;

      // Validation
      if (!categoryId) {
        throw new CustomError("Category ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      await this.deleteCategoryUseCase.execute(categoryId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

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
      workoutData.category = new Types.ObjectId(workoutData.category);

      const files = { image: req.body.image };
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

      // Validation
      if (!workoutId) {
        throw new CustomError("Workout ID not provided", HTTP_STATUS.BAD_REQUEST);
      }

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

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.getAllCategoriesUseCase.execute();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        categories,
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
}