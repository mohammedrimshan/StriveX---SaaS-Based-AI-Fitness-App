import { Request, Response } from "express";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../../../shared/constants";
import { inject, injectable } from "tsyringe";
import { IAdminController } from "@/entities/controllerInterfaces/admin-controller.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import {
  updateMembershipPlanSchema,
  createMembershipPlanSchema,
} from "@/shared/validations/membership-plan.schema";
import { IGetTrainerRequestsUseCase } from "@/entities/useCaseInterfaces/admin/get-user-trainer-request-usecase.interface";
import { IUpdateTrainerRequestUseCase } from "@/entities/useCaseInterfaces/admin/update-user-trainer-request-usecase.interface";
import { IGetReportedPostsUseCase } from "@/entities/useCaseInterfaces/community/get-reported-posts-usecase.interface";
import { IGetReportedCommentsUseCase } from "@/entities/useCaseInterfaces/community/get-reported-comments-usecase.interface";
import { IHardDeletePostUseCase } from "@/entities/useCaseInterfaces/community/hard-delete-post-usecase.interface";
import { IHardDeleteCommentUseCase } from "@/entities/useCaseInterfaces/community/hard-delete-comment-usecase.interface";
import mongoose from "mongoose";
@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject("IMembershipPlanRepository")
    private _membershipPlanRepository: IMembershipPlanRepository,
    @inject("IGetTrainerRequestsUseCase")
    private _getTrainerRequestsUseCase: IGetTrainerRequestsUseCase,
    @inject("IUpdateTrainerRequestUseCase")
    private _updateTrainerRequestUseCase: IUpdateTrainerRequestUseCase,
    @inject("IGetReportedPostsUseCase")
    private _getReportedPostsUseCase: IGetReportedPostsUseCase,
    @inject("IGetReportedCommentsUseCase")
    private _getReportedCommentsUseCase: IGetReportedCommentsUseCase,
    @inject("IHardDeletePostUseCase")
    private _hardDeletePostUseCase: IHardDeletePostUseCase,
    @inject("IHardDeleteCommentUseCase")
    private _hardDeleteCommentUseCase: IHardDeleteCommentUseCase
  ) {}

  async getMembershipPlans(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, searchTerm = "" } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const filter = searchTerm
        ? { name: { $regex: searchTerm as string, $options: "i" } }
        : {};

      const { items: plans, total } = await this._membershipPlanRepository.find(
        filter,
        (pageNumber - 1) * pageSize,
        pageSize
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        plans,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalPlans: total,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async createMembershipPlan(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createMembershipPlanSchema.parse(req.body);
      await this._membershipPlanRepository.save({
        name: validatedData.name,
        durationMonths: validatedData.durationMonths,
        price: validatedData.price,
        isActive: validatedData.isActive ?? true,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateMembershipPlan(req: Request, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const validatedData = updateMembershipPlanSchema.parse(req.body);

      if (!planId) {
        throw new CustomError("Plan ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      const plan = await this._membershipPlanRepository.findById(planId);
      if (!plan) {
        throw new CustomError(
          "Membership plan not found",
          HTTP_STATUS.NOT_FOUND
        );
      }

      await this._membershipPlanRepository.update(planId, validatedData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async deleteMembershipPlan(req: Request, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      if (!planId) {
        throw new CustomError("Plan ID is required", HTTP_STATUS.BAD_REQUEST);
      }

      const deleted = await this._membershipPlanRepository.delete(planId);
      if (!deleted) {
        throw new CustomError(
          "Membership plan not found",
          HTTP_STATUS.NOT_FOUND
        );
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getTrainerRequests(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const searchTerm = typeof search === "string" ? search.trim() : "";
      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const { user: requests, total } =
        await this._getTrainerRequestsUseCase.execute(
          pageNumber,
          pageSize,
          searchTerm
        );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        requests,
        totalPages: total,
        currentPage: pageNumber,
        totalRequests: requests.length,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateTrainerRequest(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, trainerId } = req.body;
      if (!clientId || !trainerId) {
        throw new CustomError(
          ERROR_MESSAGES.MISSING_PARAMETERS,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const updatedRequest = await this._updateTrainerRequestUseCase.execute(
        clientId,
        trainerId
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TRAINER_REQUEST_UPDATED,
        request: updatedRequest,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getReportedPosts(req: Request, res: Response): Promise<void> {
    try {
      const posts = await this._getReportedPostsUseCase.execute();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        posts,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getReportedComments(req: Request, res: Response): Promise<void> {
    try {
      const comments = await this._getReportedCommentsUseCase.execute();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        comments,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async hardDeletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._hardDeletePostUseCase.execute(id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async hardDeleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._hardDeleteCommentUseCase.execute(id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
