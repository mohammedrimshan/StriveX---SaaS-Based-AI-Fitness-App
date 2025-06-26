"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("../config/swagger");
const config_1 = require("../../shared/config");
const auth_route_1 = require("../routes/auth/auth.route");
const private_route_1 = require("../routes/private/private.route");
const chat_route_1 = require("../routes/chat/chat.route");
const health_route_1 = require("../routes/health.route");
const dataParserMiddleware_1 = require("@/interfaceAdapters/middlewares/dataParserMiddleware");
const not_found_middleware_1 = require("@/interfaceAdapters/middlewares/not-found.middleware");
const error_middlewares_1 = require("../../interfaceAdapters/middlewares/error.middlewares");
class Server {
    constructor() {
        this._app = (0, express_1.default)();
        this.configureMiddleware();
        this.configureRoutes();
        this.configureErrorHandling();
    }
    configureMiddleware() {
        this._app.use((0, morgan_1.default)(config_1.config.loggerStatus));
        this._app.use((0, helmet_1.default)());
        this._app.use((0, cors_1.default)({
            origin: config_1.config.cors.ALLOWED_ORIGIN,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Authorization", "Content-Type"],
            credentials: true,
        }));
        this._app.use(dataParserMiddleware_1.dataParser);
        this._app.use(express_1.default.json({ limit: "40mb" }));
        this._app.use(express_1.default.urlencoded({ limit: "40mb", extended: true }));
        this._app.use((0, express_fileupload_1.default)({
            limits: { fileSize: 50 * 1024 * 1024 },
            abortOnLimit: true,
        }));
        this._app.use((0, cookie_parser_1.default)());
        this._app.use((0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 1000,
        }));
    }
    configureRoutes() {
        this._app.use('/api/v1/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
        this._app.use("/api/v1/auth", new auth_route_1.AuthRoutes().router);
        this._app.use("/api/v1/pvt", new private_route_1.PrivateRoutes().router);
        this._app.use("/api/v1/pvt/_cl/chats", new chat_route_1.ChatRoutes().router);
        this._app.use("/api/v1/pvt/_tra/chats", new chat_route_1.ChatRoutes().router);
        this._app.use("/api/v1", new health_route_1.HealthRoute().router);
        this._app.use("*", not_found_middleware_1.notFound);
    }
    configureErrorHandling() {
        this._app.use(error_middlewares_1.errorHandler);
    }
    getApp() {
        return this._app;
    }
}
exports.Server = Server;
