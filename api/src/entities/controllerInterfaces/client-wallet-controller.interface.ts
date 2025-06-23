import { Request, Response } from "express";

export interface IClientWalletController {
  getWalletDetails(req: Request, res: Response): Promise<void>;
}