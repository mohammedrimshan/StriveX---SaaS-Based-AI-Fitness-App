import { Request, Response } from "express";

export interface IAdminController {
  createMembershipPlan(req: Request, res: Response): Promise<void>;
  updateMembershipPlan(req: Request, res: Response): Promise<void>;
  deleteMembershipPlan(req: Request, res: Response): Promise<void>;
  getMembershipPlans(req: Request, res: Response): Promise<void>;
  getTrainerRequests(req: Request, res: Response): Promise<void>;
  updateTrainerRequest(req: Request, res: Response): Promise<void>;
  getReportedPosts(req: Request, res: Response): Promise<void>;
  getReportedComments(req: Request, res: Response): Promise<void>;
  hardDeletePost(req: Request, res: Response): Promise<void>;
  hardDeleteComment(req: Request, res: Response): Promise<void>;
}
