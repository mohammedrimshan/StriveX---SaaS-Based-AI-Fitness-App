import { Request, Response } from "express";

export interface IReviewController {
  submitReview(req: Request, res: Response): Promise<void>;
  updateReview(req: Request, res: Response): Promise<void>;
  getTrainerReviews(req: Request, res: Response): Promise<void>;
}
