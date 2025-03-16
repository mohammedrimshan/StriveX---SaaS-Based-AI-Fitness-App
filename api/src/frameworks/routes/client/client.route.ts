
import { Request, RequestHandler, Response } from "express";


import {
	authorizeRole,
	decodeToken,
	verifyAuth,
} from "../../../interfaceAdapters/middlewares/auth.middleware";
import {
	blockStatusMiddleware,
	logoutController,
	refreshTokenController
} from "../../di/resolver";

import { BaseRoute } from "../base.route";

export class ClientRoutes extends BaseRoute {
	constructor() {
		super();
	}
	protected initializeRoutes(): void {

		// logout
		this.router.post(
			"/client/logout",
			verifyAuth,
			authorizeRole(["client"]),
			blockStatusMiddleware.checkStatus as RequestHandler,
			(req: Request, res: Response) => {
				logoutController.handle(req, res);
			}
		);

		this.router.post(
			"/client/refresh-token",
			decodeToken,
			(req: Request, res: Response) => {
				console.log("refreshing client", req.body);
				refreshTokenController.handle(req, res);
			}
		);
	}
}
