import { Request, Response } from "express";

export interface IVideoCallController {
  startVideoCall(req: Request, res: Response): Promise<void>;
  joinVideoCall(req: Request, res: Response): Promise<void>;
  getVideoCallDetails(req: Request, res: Response): Promise<void>;
  endVideoCall(req: Request, res: Response): Promise<void>;
}