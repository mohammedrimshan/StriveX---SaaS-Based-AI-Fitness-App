"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRoutes = void 0;
const base_route_1 = require("../base.route");
const auth_middleware_1 = require("../../../interfaceAdapters/middlewares/auth.middleware");
const resolver_1 = require("../../di/resolver");
class SlotRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        const router = this.router;
        // Create a new slot (trainer only)
        router.post("/create", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.createSlot(req, res);
        });
        // Get trainer's slots (client or trainer)
        router.get("/trainer", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client", "trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.getTrainerSlots(req, res);
        });
        // Book a slot (client only)
        router.post("/book", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.bookSlot(req, res);
        });
        // Cancel a booking (client only)
        router.post("/cancel", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.slotController.cancelBooking(req, res);
        });
    }
}
exports.SlotRoutes = SlotRoutes;
