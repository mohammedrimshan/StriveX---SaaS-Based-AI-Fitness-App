
import { BaseRoute } from "../base.route";

import { ClientRoutes } from "../client/client.route";
import { AdminRoutes } from "../admin/admin.route";
export class PrivateRoutes extends BaseRoute {
	constructor() {
		super();
	}
	protected initializeRoutes(): void {
		this.router.use("/_cl", new ClientRoutes().router);
		this.router.use("/_ad", new AdminRoutes().router);
	}
}
