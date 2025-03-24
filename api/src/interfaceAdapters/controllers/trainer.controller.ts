import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { ITrainerController } from "@/entities/controllerInterfaces/trainer-controller.interface";
import { IGetAllUsersUseCase } from "@/entities/useCaseInterfaces/admin/get-all-users-usecase.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { ITrainerVerificationUseCase } from "@/entities/useCaseInterfaces/admin/trainer-verification-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES, TrainerApprovalStatus } from "@/shared/constants";

@injectable()
export class TrainerController implements ITrainerController {
  constructor(
    @inject("IGetAllUsersUseCase") private getAllUsersUseCase: IGetAllUsersUseCase,
    @inject("IUpdateUserStatusUseCase") private updateUserStatusUseCase: IUpdateUserStatusUseCase,
    @inject("ITrainerVerificationUseCase") private trainerVerificationUseCase: ITrainerVerificationUseCase
  ) {}

  /** 🔹 Get all trainers with pagination and search */
  async getAllTrainers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 5, search = "", userType } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const userTypeString = typeof userType === "string" ? userType : "trainer";
      const searchTermString = typeof search === "string" ? search : "";

      const { user, total } = await this.getAllUsersUseCase.execute(
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
      this.handleError(error, res);
    }
  }

  /** 🔹 Update trainer status (approve/reject) */
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId, status } = req.body;
      await this.updateUserStatusUseCase.execute(trainerId, status);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** 🔹 Verify and approve/reject trainer */
  async trainerVerification(req: Request, res: Response): Promise<void> {
    try {
      console.log("Received body:", req.body); 
      const { clientId, approvalStatus, rejectionReason } = req.body;
      
      console.log("Extracted:", { clientId, approvalStatus, rejectionReason }); 
  
      if (!clientId || !approvalStatus) {
        throw new CustomError("Client ID and approval status are required", HTTP_STATUS.BAD_REQUEST);
      }
  
      if (![TrainerApprovalStatus.APPROVED, TrainerApprovalStatus.REJECTED].includes(approvalStatus)) {
        throw new CustomError("Invalid approval status", HTTP_STATUS.BAD_REQUEST);
      }
  
      await this.trainerVerificationUseCase.execute(clientId, approvalStatus, rejectionReason);
  
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Trainer ${approvalStatus.toLowerCase()} successfully`,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** 🔹 Centralized error handling */
  private handleError(error: unknown, res: Response): void {
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

    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
}
