import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { IUserController } from "@/entities/controllerInterfaces/client-controller.interface";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { IUpdateUserProfileUseCase } from "@/entities/useCaseInterfaces/users/update-user-profile-usecase.interface";
import { IUpdateClientPasswordUseCase } from "@/entities/useCaseInterfaces/users/change-logged-in-user-password-usecase.interface";
import { IGetUserProgressUseCase } from "@/entities/useCaseInterfaces/workout/get-user-progress-usecase.interface";
import { IRecordProgressUseCase } from "@/entities/useCaseInterfaces/workout/record-progress-usecase.interface";
import { IGetAllTrainersUseCase } from "@/entities/useCaseInterfaces/users/get-all-trainers.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { IClientEntity } from "@/entities/models/client.entity";
import { IProgressEntity } from "@/entities/models/progress.entity";
import { CustomRequest } from "../middlewares/auth.middleware";
import { IGetTrainerProfileUseCase } from "@/entities/useCaseInterfaces/users/get-trainer-profile.usecase.interface";

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject("IGetAllUsersUseCase")
    private _getAllUsersUseCase: IGetAllUsersUseCase,
    @inject("IUpdateUserStatusUseCase")
    private _updateUserStatusUseCase: IUpdateUserStatusUseCase,
    @inject("IUpdateUserProfileUseCase")
    private _updateUserProfileUseCase: IUpdateUserProfileUseCase,
    @inject("IUpdateClientPasswordUseCase")
    private _changeUserPasswordUseCase: IUpdateClientPasswordUseCase,
    @inject("IGetUserProgressUseCase")
    private _getUserProgressUseCase: IGetUserProgressUseCase,
    @inject("IGetWorkoutsUseCase")
    private _recordProgressUseCase: IRecordProgressUseCase,
    @inject("IGetAllTrainersUseCase")
    private _getAllTrainersUseCase: IGetAllTrainersUseCase,
    @inject("IGetTrainerProfileUseCase")
    private _getTrainerProfileUseCase: IGetTrainerProfileUseCase
  ) {}

  // Get all users with pagination, search and filtering by user type
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

      const { user, total } = await this._getAllUsersUseCase.execute(
        userTypeString,
        pageNumber,
        pageSize,
        searchTermString
      );

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

  // Update user status (active/blocked)
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

      await this._updateUserStatusUseCase.execute(
        userType.toLowerCase(),
        userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Update user profile information
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
          if (
            key === "healthConditions" &&
            typeof profileData[key] === "string"
          ) {
            try {
              updates[key] = JSON.parse(profileData[key]);
              if (!Array.isArray(updates[key])) {
                throw new Error("healthConditions must be an array");
              }
            } catch (e) {
              throw new CustomError(
                "Invalid healthConditions format",
                HTTP_STATUS.BAD_REQUEST
              );
            }
          } else {
            updates[key] = profileData[key];
          }
        }
      }

      const updatedUser = await this._updateUserProfileUseCase.execute(
        userId,
        updates
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS,
        user: updatedUser,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Change user password
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

      await this._changeUserPasswordUseCase.execute(
        id,
        currentPassword,
        newPassword
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Get user's workout progress
  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const progress = await this._getUserProgressUseCase.execute(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: progress,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Record user's workout progress
  async recordProgress(req: Request, res: Response): Promise<void> {
    try {
      const progressData = req.body as Omit<IProgressEntity, "_id">;

      const recordedProgress = await this._recordProgressUseCase.execute(
        progressData
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Progress recorded successfully",
        data: recordedProgress,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Get all trainers with pagination and search
  async getAllTrainers(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "5", search = "" } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
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

      const { trainers, total } = await this._getAllTrainersUseCase.execute(
        pageNumber,
        pageSize,
        searchTermString
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        trainers,
        totalPages: total,
        currentPage: pageNumber,
        totalTrainers:
          trainers.length === 0
            ? 0
            : (pageNumber - 1) * pageSize + trainers.length,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  // Get trainer profile by ID
  async getTrainerProfile(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;

      if (!trainerId) {
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const trainer = await this._getTrainerProfileUseCase.execute(trainerId);

      if (!trainer) {
        throw new CustomError(
          ERROR_MESSAGES.TRAINER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        trainer,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
