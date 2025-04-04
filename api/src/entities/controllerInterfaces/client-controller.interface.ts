import { Request, Response } from "express";

export interface IUserController {
  getAllUsers(req: Request, res: Response): Promise<void>;
  updateUserStatus(req: Request, res: Response): Promise<void>;
  updateUserProfile(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
  getAllCategories(req: Request, res: Response): Promise<void>;
  generateWork(req: Request, res: Response): Promise<void>;
  generateDiet(req: Request, res: Response): Promise<void>;
  getWorkouts(req: Request, res: Response): Promise<void>;
  getDietplan(req: Request, res: Response): Promise<void>;
  getAllTrainers(req: Request, res: Response): Promise<void>;
}
