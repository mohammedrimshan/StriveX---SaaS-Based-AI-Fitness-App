import { Request, Response } from "express";

export interface IUserController {
  getAllUsers(req: Request, res: Response): Promise<void>;
  updateUserStatus(req: Request, res: Response): Promise<void>;
  updateUserProfile(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
  getAllTrainers(req: Request, res: Response): Promise<void>;
  getTrainerProfile(req:Request,res:Response):Promise<void>;
  saveTrainerSelectionPreferences(req: Request, res: Response): Promise<void>;
  autoMatchTrainer(req: Request, res: Response): Promise<void>;
  manualSelectTrainer(req: Request, res: Response): Promise<void>;
  getMatchedTrainers(req: Request, res: Response): Promise<void>;
  selectTrainer(req: Request, res: Response): Promise<void>;
}
