import { Request, Response } from "express";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../../../shared/constants";
import { inject, injectable } from "tsyringe";
import { IAdminController } from "@/entities/controllerInterfaces/admin-controller.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import { updateMembershipPlanSchema ,createMembershipPlanSchema} from "@/shared/validations/membership-plan.schema";
import { Types } from "mongoose";
@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject("IMembershipPlanRepository") private _membershipPlanRepository: IMembershipPlanRepository
  ) {}

  async getMembershipPlans(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, searchTerm = "" } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);
  
      if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        throw new CustomError("Invalid pagination parameters", HTTP_STATUS.BAD_REQUEST);
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
        throw new CustomError("Membership plan not found", HTTP_STATUS.NOT_FOUND);
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
        throw new CustomError(
          "Plan ID is required",
          HTTP_STATUS.BAD_REQUEST
        );
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
}
