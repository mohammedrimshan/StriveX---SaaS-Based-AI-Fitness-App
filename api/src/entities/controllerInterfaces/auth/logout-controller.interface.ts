import { Request, Response } from "express";

export interface ILogoutUserController {
	handle(req: Request, res: Response): Promise<void>;
};
