import { Request, Response } from "express";

export interface IChatController {
  getChatHistory(req: Request, res: Response): Promise<void>;
  getRecentChats(req: Request, res: Response): Promise<void>;
  getChatParticipants(req: Request, res: Response): Promise<void>;
}