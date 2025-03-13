import { Request, Response } from "express";

export interface IRefreshTokenController {
	handle(req: Request, res: Response): void;
}
