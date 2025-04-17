import { Request, Response } from "express";

export interface IPaymentController {
  createCheckoutSession(req: Request, res: Response): Promise<void>;
  handleWebhook(req: Request, res: Response): Promise<void>;
  getMembershipPlans(req: Request, res: Response): Promise<void>;
}