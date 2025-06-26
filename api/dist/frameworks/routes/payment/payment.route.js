"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const auth_middleware_1 = require("@/interfaceAdapters/middlewares/auth.middleware");
const resolver_1 = require("../../di/resolver");
const base_route_1 = require("../base.route");
class PaymentRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        const router = this.router;
        // Get Active Membership Plans
        router.get("/payment/plans", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client", "trainer", "admin"]), 
        //blockStatusMiddleware.checkStatus as RequestHandler,
        (req, res) => {
            resolver_1.paymentController.getMembershipPlans(req, res);
        });
        router.post("/payment/webhook", (req, res) => {
            resolver_1.paymentController.handleWebhook(req, res);
        });
    }
}
exports.PaymentRoutes = PaymentRoutes;
