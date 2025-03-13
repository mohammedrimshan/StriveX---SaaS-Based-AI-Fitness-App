import { Request, Response } from "express";
import { BaseRoute } from "../base.route";
import { registerController } from "../../di/resolver";
export class AuthRoutes extends BaseRoute{
    constructor(){
        super()
    }
    protected initializeRoutes(): void {
        let router = this.router;
        router.post("/signup", (req: Request, res: Response) => {
			registerController.handle(req, res);
		});
       
    }
}

