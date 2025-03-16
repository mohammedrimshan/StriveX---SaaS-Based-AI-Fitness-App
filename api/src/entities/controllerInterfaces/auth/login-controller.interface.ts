import { Request, Response } from "express";

export interface ILoginUserController {
	handle(req: Request, res: Response): Promise<void>;
}
