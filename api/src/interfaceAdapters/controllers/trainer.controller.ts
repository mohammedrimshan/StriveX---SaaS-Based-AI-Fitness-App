import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { ITrainerController } from "@/entities/controllerInterfaces/trainer-controller.interface";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { ITrainerVerificationUseCase } from "@/entities/useCaseInterfaces/admin/trainer-verification-usecase.interface";
import { IUpdateTrainerProfileUseCase } from "@/entities/useCaseInterfaces/trainer/update-trainer-profile.usecase.interface";
import { IUpdateTrainerPasswordUseCase } from "@/entities/useCaseInterfaces/trainer/update-trainer-password.usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  TrainerApprovalStatus,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { trainerUpdateSchema } from "@/shared/validations/update.validation";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { CustomRequest } from "../middlewares/auth.middleware";


@injectable()
export class TrainerController implements ITrainerController {
  constructor(
    @inject("IGetAllUsersUseCase")
    private _getAllUsersUseCase: IGetAllUsersUseCase,
    @inject("IUpdateUserStatusUseCase")
    private _updateUserStatusUseCase: IUpdateUserStatusUseCase,
    @inject("ITrainerVerificationUseCase")
    private _trainerVerificationUseCase: ITrainerVerificationUseCase,
    @inject("IUpdateTrainerProfileUseCase")
    private _updateTrainerProfileUseCase: IUpdateTrainerProfileUseCase,
    @inject("IUpdateTrainerPasswordUseCase")
    private _changeTrainerPasswordUseCase: IUpdateTrainerPasswordUseCase
  ) {}

  /** 🔹 Get all trainers with pagination and search */
  async getAllTrainers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 5, search = "", userType } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const userTypeString =
        typeof userType === "string" ? userType : "trainer";
      const searchTermString = typeof search === "string" ? search : "";

      const { user, total } = await this._getAllUsersUseCase.execute(
        userTypeString,
        pageNumber,
        pageSize,
        searchTermString
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        user,
        totalPages: total,
        currentPage: pageNumber,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }


  /** 🔹 Update trainer status (approve/reject) */
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId, status } = req.body;
      await this._updateUserStatusUseCase.execute(trainerId, status);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  /** 🔹 Verify and approve/reject trainer */
  async trainerVerification(req: Request, res: Response): Promise<void> {
    try {
      console.log("Received body:", req.body);
      const { clientId, approvalStatus, rejectionReason } = req.body;

      console.log("Extracted:", { clientId, approvalStatus, rejectionReason });

      if (!clientId || !approvalStatus) {
        throw new CustomError(
          "Client ID and approval status are required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (
        ![
          TrainerApprovalStatus.APPROVED,
          TrainerApprovalStatus.REJECTED,
        ].includes(approvalStatus)
      ) {
        throw new CustomError(
          "Invalid approval status",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._trainerVerificationUseCase.execute(
        clientId,
        approvalStatus,
        rejectionReason
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Trainer ${approvalStatus.toLowerCase()} successfully`,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  /** 🔹 Update trainer profile */
  async updateTrainerProfile(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.params.trainerId;
      const profileData = req.body;

      if (!trainerId) {
        throw new CustomError(
          ERROR_MESSAGES.ID_NOT_PROVIDED,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const validatedData = trainerUpdateSchema.parse(profileData);
      const allowedFields = [
        "firstName",
        "lastName",
        "phoneNumber",
        "profileImage",
        "height",
        "weight",
        "dateOfBirth",
        "gender",
        "experience",
        "skills",
        "qualifications",
        "specialization",
        "certifications",
      ] as const;

      // Type the updates object explicitly
      const updates: Partial<ITrainerEntity> = {};
      for (const key of allowedFields) {
        if (key in validatedData && validatedData[key] !== undefined) {
          // Type-safe assignment
          updates[key] = validatedData[key] as any; 
        }
      }

      const updatedTrainer = await this._updateTrainerProfileUseCase.execute(
        trainerId,
        updates
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS,
        trainer: updatedTrainer,
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
          ERROR_MESSAGES.CURRENT_PASSWORD,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (currentPassword === newPassword) {
        throw new CustomError(
          ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._changeTrainerPasswordUseCase.execute(
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
}
