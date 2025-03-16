import { Request, Response } from "express";

export interface IUserController {
	getAllUsers(req: Request, res: Response): Promise<void>;
}
