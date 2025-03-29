import { Request, Response } from "express";
import { ICreateNewCategoryUseCase } from "@/entities/useCaseInterfaces/admin/create-new-category.interface";
import { IGetAllPaginatedCategoryUseCase } from "@/entities/useCaseInterfaces/admin/get-all-paginated-category-usecase.interface";
import { IUpdateCategoryStatusUseCase } from "../../../entities/useCaseInterfaces/admin/update-category-status-usecase.interface";
import { IDeleteCategoryUseCase } from "@/entities/useCaseInterfaces/admin/delete-category-usecase.interface";
import { IUpdateCategoryUseCase } from "@/entities/useCaseInterfaces/admin/update-category-usecase.interface";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../../../shared/constants";
import { inject, injectable } from "tsyringe";
import { IAdminController } from "@/entities/controllerInterfaces/admin-controller.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";

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
    private deleteCategoryUseCase: IDeleteCategoryUseCase
  ) {}

  // Create a new category with name and optional description
  async createNewCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body as { name: string; description?: string };
      await this.createNewCategoryUseCase.execute(name, description);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
      // Check if this is a duplicate category error
      if (error instanceof Error && error.message.includes('Category already exists')) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: "A category with this name already exists",
          error: "DUPLICATE_CATEGORY"
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

      if (!name) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Category name is required",
        });
        return;
      }

      await this.updateCategoryUseCase.execute(categoryId, name, description);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      // Check if this is a duplicate category error
      if (error instanceof Error && error.message.includes('Category already exists')) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: "A category with this name already exists",
          error: "DUPLICATE_CATEGORY"
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
      await this.deleteCategoryUseCase.execute(categoryId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}