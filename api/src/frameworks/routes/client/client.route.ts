
import { Request, RequestHandler, Response } from "express";


import {
	authorizeRole,
	decodeToken,
	verifyAuth,
} from "../../../interfaceAdapters/middlewares/auth.middleware";
import {
	blockStatusMiddleware,
	authController
} from "../../di/resolver";

import { BaseRoute } from "../base.route";

export class ClientRoutes extends BaseRoute {
	constructor() {
		super();
	}
	protected initializeRoutes(): void {
		let router = this.router;
		// logout
		router.post(
			"/client/logout",
			verifyAuth,
			authorizeRole(["client"]),
			blockStatusMiddleware.checkStatus as RequestHandler,
			(req: Request, res: Response) => {
				authController.logout(req, res);
			}
		);

		router.post(
			"/client/refresh-token",
			decodeToken,
			(req: Request, res: Response) => {
				console.log("refreshing client", req.body);
				authController.handleTokenRefresh(req, res);
			}
		);
	}
}
