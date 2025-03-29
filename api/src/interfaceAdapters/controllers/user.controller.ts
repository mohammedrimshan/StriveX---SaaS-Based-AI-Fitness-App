import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { IUserController } from "@/entities/controllerInterfaces/client-controller.interface";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { IUpdateUserProfileUseCase } from "@/entities/useCaseInterfaces/users/update-user-profile-usecase.interface";
import { IUpdateClientPasswordUseCase } from "@/entities/useCaseInterfaces/users/change-logged-in-user-password-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomRequest } from "../middlewares/auth.middleware";
import { IGetAllCategoriesUseCase } from "@/entities/useCaseInterfaces/common/get-all-category.interface";
@injectable()
export class UserController implements IUserController {
  constructor(
    @inject("IGetAllUsersUseCase")
    private getAllUsersUseCase: IGetAllUsersUseCase,
    @inject("IUpdateUserStatusUseCase")
    private updateUserStatusUseCase: IUpdateUserStatusUseCase,
    @inject("IUpdateUserProfileUseCase")
    private updateUserProfileUseCase: IUpdateUserProfileUseCase,
    @inject("IUpdateClientPasswordUseCase")
    private changeUserPasswordUseCase: IUpdateClientPasswordUseCase,
    @inject("IGetAllCategoriesUseCase")
    private getAllCategoriesUseCase: IGetAllCategoriesUseCase
  ) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "5", search = "", userType } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const userTypeString =
        typeof userType === "string" ? userType.toLowerCase() : "client";
      const searchTermString = typeof search === "string" ? search.trim() : "";

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION_ERROR,
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
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        users: user,
        totalPages: total,
        currentPage: pageNumber,
        totalUsers:
          user.length === 0 ? 0 : (pageNumber - 1) * pageSize + user.length,
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

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userType, userId } = req.query as {
        userType: string;
        userId: any;
      };

      if (!userType || !userId) {
        throw new CustomError(
          ERROR_MESSAGES.MISSING_PARAMETERS,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (!["client", "trainer"].includes(userType.toLowerCase())) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ROLE,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this.updateUserStatusUseCase.execute(
        userType.toLowerCase(),
        userId
      );

      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const profileData = req.body;

      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const allowedFields: (keyof Partial<IClientEntity>)[] = [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "profileImage",
        "height",
        "weight",
        "fitnessGoal",
        "experienceLevel",
        "activityLevel",
        "healthConditions",
        "waterIntake",
        "dietPreference",
      ];

      const updates: Partial<IClientEntity> = {};
      for (const key of allowedFields) {
        if (profileData[key] !== undefined) {
          updates[key] = profileData[key];
        }
      }

      const updatedUser = await this.updateUserProfileUseCase.execute(
        userId,
        updates
      );

      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS,
        user: updatedUser,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const id = (req as CustomRequest).user.id;
      const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
      };

      if (!id) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!currentPassword || !newPassword) {
        throw new CustomError(
          ERROR_MESSAGES.MISSING_FIELDS,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (currentPassword === newPassword) {
        throw new CustomError(
          ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this.changeUserPasswordUseCase.execute(
        id,
        currentPassword,
        newPassword
      );

      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
