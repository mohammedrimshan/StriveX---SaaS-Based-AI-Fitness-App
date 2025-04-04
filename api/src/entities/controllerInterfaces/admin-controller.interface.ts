import { Request, Response } from "express";

export interface IAdminController {
  createNewCategory(req: Request, res: Response): Promise<void>;
  getAllPaginatedCategories(req: Request, res: Response): Promise<void>;
  updateCategoryStatus(req: Request, res: Response): Promise<void>;
  updateCategory(req: Request, res: Response): Promise<void>;
  deleteCategory(req: Request, res: Response): Promise<void>;
  addWorkout(req: Request, res: Response): Promise<void>;
  updateWorkout(req: Request, res: Response): Promise<void>;
  deleteWorkout(req: Request, res: Response): Promise<void>;
  getAllCategories(req: Request, res: Response): Promise<void>;
  getAllAdminWorkouts(req: Request, res: Response): Promise<void>;
}