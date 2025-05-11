import { Request, Response } from "express";

export interface IWorkoutVideoProgressController {
  updateVideoProgress(req: Request, res: Response): Promise<void>;
  getUserVideoProgress(req: Request, res: Response): Promise<void>;
  getVideoProgressByUserAndWorkout(req: Request, res: Response): Promise<void>;
}