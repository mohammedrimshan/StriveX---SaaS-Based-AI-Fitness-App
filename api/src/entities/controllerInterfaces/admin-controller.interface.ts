import { Request, Response } from "express";

export interface IAdminController {
    createNewCategory(req: Request, res: Response): Promise<void>;
    getAllPaginatedCategories(req: Request, res: Response): Promise<void>;
  updateCategoryStatus(req: Request, res: Response): Promise<void>;
  updateCategory(req: Request, res: Response): Promise<void>;
  deleteCategory(req: Request, res: Response): Promise<void>;
}

