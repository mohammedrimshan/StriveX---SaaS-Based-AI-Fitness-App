import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { IUserController } from "@/entities/controllerInterfaces/client-controller.interface";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { IUpdateUserProfileUseCase } from "@/entities/useCaseInterfaces/users/update-user-profile-usecase.interface";
import { IUpdateClientPasswordUseCase } from "@/entities/useCaseInterfaces/users/change-logged-in-user-password-usecase.interface";
import { IGenerateWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-workout-plans.usecase.interface";
import { IGenerateDietPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-diet-plans.usecase.interface";
import { IGetWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/get-workout-plans.usecase.interface";
import { IGetDietPlanUseCase } from "@/entities/useCaseInterfaces/users/get-diet-plans.usecase.interface";
import { IGetUserProgressUseCase } from "@/entities/useCaseInterfaces/workout/get-user-progress-usecase.interface";
import { IGetWorkoutsByCategoryUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-by-category-usecase.interface";
import { IGetWorkoutsUseCase } from "@/entities/useCaseInterfaces/workout/get-workout-usecase.interface";
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
import { IGetAllCategoriesUseCase } from "@/entities/useCaseInterfaces/common/get-all-category.interface";
import { IGetTrainerProfileUseCase } from "@/entities/useCaseInterfaces/users/get-trainer-profile.usecase.interface";


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
    @inject("IGetUserProgressUseCase")
    private getUserProgressUseCase: IGetUserProgressUseCase,
    @inject("IGetWorkoutsUseCase")
    private recordProgressUseCase: IRecordProgressUseCase,
    @inject("IGetAllTrainersUseCase")
    private getAllTrainersUseCase: IGetAllTrainersUseCase,
    @inject("IGetTrainerProfileUseCase")
    private getTrainerProfileUseCase : IGetTrainerProfileUseCase
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

    

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        );
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

      const { trainers, total } = await this.getAllTrainersUseCase.execute(
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
          trainers.length === 0 ? 0 : (pageNumber - 1) * pageSize + trainers.length,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getTrainerProfile(req: Request, res: Response): Promise<void> {
    try {
      const {trainerId} = req.params

      if(!trainerId){
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        )
      }

      const trainer = await this.getTrainerProfileUseCase.execute(trainerId);

      if(!trainer){
        throw new CustomError(
          ERROR_MESSAGES.TRAINER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        )
      }

      res.status(HTTP_STATUS.OK).json({
        success:true,
        message:SUCCESS_MESSAGES.DATA_RETRIEVED,
        trainer
      })
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

}
