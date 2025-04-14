
import { Request, Response } from "express";

export interface IDietWorkoutController {
  addWorkout(req: Request, res: Response): Promise<void>;
  updateWorkout(req: Request, res: Response): Promise<void>;
  deleteWorkout(req: Request, res: Response): Promise<void>;
  getAllAdminWorkouts(req: Request, res: Response): Promise<void>;
  getWorkouts(req: Request, res: Response): Promise<void>;
  generateWork(req: Request, res: Response): Promise<void>;
  generateDiet(req: Request, res: Response): Promise<void>;
  getDietplan(req: Request, res: Response): Promise<void>;
  toggleWorkoutStatus(req: Request, res: Response): Promise<void>;
  getWorkoutsByCategory(req: Request, res: Response): Promise<void>;
  getAllWorkouts(req: Request, res: Response): Promise<void>;
  addExercise(req: Request, res: Response): Promise<void>;
  updateExercise(req: Request, res: Response): Promise<void>;
  deleteExercise(req: Request, res: Response): Promise<void>;
  getWorkoutById(req: Request, res: Response): Promise<void>;
}