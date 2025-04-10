import { Request, Response } from "express";

export interface ITrainerController {
  getAllTrainers(req: Request, res: Response): Promise<void>;
  updateUserStatus(req: Request, res: Response): Promise<void>;
  trainerVerification(req: Request, res: Response): Promise<void>;
  updateTrainerProfile(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
}
