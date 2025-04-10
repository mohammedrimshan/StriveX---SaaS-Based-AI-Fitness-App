
import { Request, Response } from "express";

export interface ICategoryController {
  createNewCategory(req: Request, res: Response): Promise<void>;
  getAllPaginatedCategories(req: Request, res: Response): Promise<void>;
  updateCategoryStatus(req: Request, res: Response): Promise<void>;
  updateCategory(req: Request, res: Response): Promise<void>;
  deleteCategory(req: Request, res: Response): Promise<void>;
  getAllCategories(req: Request, res: Response): Promise<void>;
}