import { Request, Response } from "express";

export interface IWorkoutProgressController {
  createProgress(req: Request, res: Response): Promise<void>;
  updateProgress(req: Request, res: Response): Promise<void>;
  getUserProgress(req: Request, res: Response): Promise<void>;
  getProgressByUserAndWorkout(req: Request, res: Response): Promise<void>;
}