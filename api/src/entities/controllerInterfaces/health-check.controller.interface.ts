import { Request, Response } from "express";

export interface IHealthController  {
    healthCheck(req: Request, res: Response): Promise<void>;
}