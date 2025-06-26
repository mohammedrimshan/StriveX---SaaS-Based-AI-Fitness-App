"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateRoutes = void 0;
const base_route_1 = require("../base.route");
const client_route_1 = require("../client/client.route");
const admin_route_1 = require("../admin/admin.route");
const trainer_route_1 = require("../trainer/trainer.route");
const payment_route_1 = require("../payment/payment.route");
class PrivateRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.use("/_cl", new client_route_1.ClientRoutes().router);
        this.router.use("/_ad", new admin_route_1.AdminRoutes().router);
        this.router.use("/_tra", new trainer_route_1.TrainerRoutes().router);
        this.router.use("/_pay", new payment_route_1.PaymentRoutes().router);
    }
}
exports.PrivateRoutes = PrivateRoutes;
