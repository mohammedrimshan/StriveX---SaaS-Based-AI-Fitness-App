import { Request, Response } from "express";

export interface ISessionHistoryController {
  getSessionHistory(req: Request, res: Response): Promise<void>;
}