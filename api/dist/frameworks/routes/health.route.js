"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRoute = void 0;
const base_route_1 = require("./base.route");
const resolver_1 = require("../di/resolver");
class HealthRoute extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.get('/health', (req, res) => {
            resolver_1.healthController.healthCheck(req, res);
        });
    }
}
exports.HealthRoute = HealthRoute;
