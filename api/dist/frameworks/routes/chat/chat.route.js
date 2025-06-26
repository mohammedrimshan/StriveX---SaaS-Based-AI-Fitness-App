"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const base_route_1 = require("../base.route");
const auth_middleware_1 = require("../../../interfaceAdapters/middlewares/auth.middleware");
const resolver_1 = require("../../di/resolver");
class ChatRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        const router = this.router;
        router.get("/history/:trainerId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client", "trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatHistory(req, res);
        });
        router.get("/recent", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client", "trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getRecentChats(req, res);
        });
        router.get("/participants", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client", "trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.getChatParticipants(req, res);
        });
        router.delete("/messages/:messageId", auth_middleware_1.verifyAuth, (0, auth_middleware_1.authorizeRole)(["client", "trainer"]), resolver_1.blockStatusMiddleware.checkStatus, (req, res) => {
            resolver_1.chatController.deleteMessage(req, res);
        });
    }
}
exports.ChatRoutes = ChatRoutes;
