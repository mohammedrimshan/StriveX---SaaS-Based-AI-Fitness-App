import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ICategoryController } from "@/entities/controllerInterfaces/category-controller.interface";
import { ICreateNewCategoryUseCase } from "@/entities/useCaseInterfaces/admin/create-new-category.interface";
import { IGetAllPaginatedCategoryUseCase } from "@/entities/useCaseInterfaces/admin/get-all-paginated-category-usecase.interface";
import { IUpdateCategoryStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-category-status-usecase.interface";
import { IUpdateCategoryUseCase } from "@/entities/useCaseInterfaces/admin/update-category-usecase.interface";
import { IGetAllCategoriesUseCase } from "@/entities/useCaseInterfaces/common/get-all-category.interface";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import mongoose from "mongoose";

@injectable()
export class CategoryController implements ICategoryController {
  constructor(
    @inject("ICreateNewCategoryUseCase")
    private _createNewCategoryUseCase: ICreateNewCategoryUseCase,
    @inject("IGetAllPaginatedCategoryUseCase")
    private _getAllPaginatedCategoryUseCase: IGetAllPaginatedCategoryUseCase,
    @inject("IUpdateCategoryStatusUseCase")
    private _updateCategoryStatusUseCase: IUpdateCategoryStatusUseCase,
    @inject("IUpdateCategoryUseCase")
    private _updateCategoryUseCase: IUpdateCategoryUseCase,
    @inject("IGetAllCategoriesUseCase")
    private _getAllCategoriesUseCase: IGetAllCategoriesUseCase
  ) {}

  async createNewCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, metValue, description } = req.body as {
        name: string;
        metValue: number;
        description?: string;
      };

      if (!name)
        throw new CustomError(
          "Category name is required",
          HTTP_STATUS.BAD_REQUEST
        );

      await this._createNewCategoryUseCase.execute(name, metValue, description);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Category already exists")
      ) {
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

  async getAllPaginatedCategories(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, searchTerm = "" } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const searchTermString = typeof searchTerm === "string" ? searchTerm : "";

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid page or limit parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { categories, total, all } =
        await this._getAllPaginatedCategoryUseCase.execute(
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

  async updateCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;

      // Enhanced validation
      if (!categoryId || categoryId === "undefined") {
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._updateCategoryStatusUseCase.execute(categoryId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const { name, description, metValue } = req.body as {
        name: string;
        metValue: number;
        description?: string;
      };

      if (!categoryId)
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        );
      if (!name)
        throw new CustomError(
          ERROR_MESSAGES.MISSING_FIELDS,
          HTTP_STATUS.BAD_REQUEST
        );

      await this._updateCategoryUseCase.execute(
        categoryId,
        name,
        metValue,
        description
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this._getAllCategoriesUseCase.execute();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        categories,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
