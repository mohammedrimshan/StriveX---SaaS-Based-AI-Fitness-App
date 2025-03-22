import { Request, Response } from "express";

export interface IAuthenticateWithGoogle {
	handle(req: Request, res: Response): Promise<void>;
}
