import { BaseRoute } from "./base.route";
import { Request, Response } from "express";
import { healthController } from "../di/resolver";
export class HealthRoute extends BaseRoute {
    constructor() {
        super()
    }

    protected initializeRoutes(): void {
        this.router.get('/health', (req: Request, res: Response) => {
            healthController.healthCheck(req, res);
        })
    }
}