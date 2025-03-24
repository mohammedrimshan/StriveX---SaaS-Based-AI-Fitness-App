import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { IUserController } from "@/entities/controllerInterfaces/client-controller.interface";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "@/shared/constants";

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject("IGetAllUsersUseCase")
    private getAllUsersUseCase: IGetAllUsersUseCase,
    @inject("IUpdateUserStatusUseCase")
    private updateUserStatusUseCase: IUpdateUserStatusUseCase
  ) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "5", search = "", userType } = req.query;

      // Parse and validate query params
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const userTypeString = typeof userType === "string" ? userType.toLowerCase() : "client";
      const searchTermString = typeof search === "string" ? search.trim() : "";

      if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        throw new CustomError(
          "Invalid page or limit value. Must be positive numbers.",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const { user, total } = await this.getAllUsersUseCase.execute(
        userTypeString,
        pageNumber,
        pageSize,
        searchTermString
      );
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      res.status(HTTP_STATUS.OK).json({
        success: true,
        users: user, 
        totalPages: total, 
        currentPage: pageNumber,
        totalUsers: user.length === 0 ? 0 : (pageNumber - 1) * pageSize + user.length,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({ message: err.message }));
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors,
        });
        return;
      }
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      console.error("Error in getAllUsers:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userType, userId } = req.query as { userType: string; userId: any };

      // Validate inputs
      if (!userType || !userId) {
        throw new CustomError(
          "userType and userId are required.",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (!["client", "trainer"].includes(userType.toLowerCase())) {
        throw new CustomError(
          "Invalid userType. Must be 'client' or 'trainer'.",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this.updateUserStatusUseCase.execute(userType.toLowerCase(), userId);

      // Disable caching for consistency
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({ message: err.message }));
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors,
        });
        return;
      }
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      console.error("Error in updateUserStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
}