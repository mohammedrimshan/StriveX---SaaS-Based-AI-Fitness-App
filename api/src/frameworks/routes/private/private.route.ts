
import { BaseRoute } from "../base.route";

import { ClientRoutes } from "../client/client.route";

export class PrivateRoutes extends BaseRoute {
	constructor() {
		super();
	}
	protected initializeRoutes(): void {
		this.router.use("/_cl", new ClientRoutes().router);
	}
}
