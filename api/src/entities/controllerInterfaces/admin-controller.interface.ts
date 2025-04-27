import { Request, Response } from "express";

export interface IAdminController {
  createMembershipPlan(req: Request, res: Response): Promise<void>;
  updateMembershipPlan(req: Request, res: Response): Promise<void>;
  deleteMembershipPlan(req: Request, res: Response): Promise<void>;
  getMembershipPlans(req: Request, res: Response): Promise<void>;
  getTrainerRequests(req: Request, res: Response): Promise<void>;
  updateTrainerRequest(req: Request, res: Response): Promise<void>;
}