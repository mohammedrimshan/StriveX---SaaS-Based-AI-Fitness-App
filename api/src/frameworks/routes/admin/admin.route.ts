
import { Request, RequestHandler, Response } from "express";

import {
	authorizeRole,
	decodeToken,
	verifyAuth,
} from "../../../interfaceAdapters/middlewares/auth.middleware";

import { BaseRoute } from "../base.route";


import {
	blockStatusMiddleware,
	logoutController,
	refreshTokenController,
    userController
} from "../../di/resolver";

export class AdminRoutes extends BaseRoute {
	constructor() {
		super();
	}
	protected initializeRoutes(): void {
    let router = this.router;
		
		// logout
	    router.post(
			"/admin/logout",
			verifyAuth,
			authorizeRole(["admin"]),
			(req: Request, res: Response) => {
				logoutController.handle(req, res);
			}
		);

        router.get(
			"/admin/users",
			verifyAuth,
			authorizeRole(["admin"]),
			(req: Request, res: Response) => {
				userController.getAllUsers(req, res);
			}
		);

        router.patch(
			"/admin/user-status",
			verifyAuth,
			authorizeRole(["admin"]),
			(req: Request, res: Response) => {
				userController.updateUserStatus(req, res);
			}
		);

		router.post(
			"/admin/refresh-token",
			decodeToken,
			(req: Request, res: Response) => {
				refreshTokenController.handle(req, res);
			}
		);
	}
}
