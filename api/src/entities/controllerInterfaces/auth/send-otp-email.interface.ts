import { Request, Response } from "express";

export interface ISendOtpEmailController {
	handle(req: Request, res: Response): Promise<void>;
}
