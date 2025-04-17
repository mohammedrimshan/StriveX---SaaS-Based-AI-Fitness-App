import { injectable } from "tsyringe";
import { IHealthController } from "@/entities/controllerInterfaces/health-check.controller.interface";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../../shared/constants";

@injectable()
export class HealthController implements IHealthController {
    async healthCheck(req: Request, res: Response): Promise<void> {
        const dbStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";

        res.status(HTTP_STATUS.OK).json({
            status: "UP",
            database: dbStatus,
            timestamp: new Date().toISOString(),
        });
    }
}
