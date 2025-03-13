import { Request, Response } from "express";

export interface IVerifyOtpController {
	handle(req: Request, res: Response): Promise<void>;
}
