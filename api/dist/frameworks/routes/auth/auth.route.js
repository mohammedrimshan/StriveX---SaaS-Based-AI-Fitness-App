"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const base_route_1 = require("../base.route");
const resolver_1 = require("../../di/resolver");
class AuthRoutes extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        let router = this.router;
        router.post("/signup", (req, res) => {
            resolver_1.authController.register(req, res);
        });
        router.post("/signin", (req, res) => {
            resolver_1.authController.login(req, res);
        });
        router.post("/google-auth", (req, res) => {
            resolver_1.authController.authenticateWithGoogle(req, res);
        });
        router.post("/send-otp", (req, res) => {
            resolver_1.authController.sendOtpEmail(req, res);
        });
        router.post("/verify-otp", (req, res) => {
            resolver_1.authController.verifyOtp(req, res);
        });
        router.post("/forgot-password", (req, res) => {
            resolver_1.authController.forgotPassword(req, res);
        });
        router.post("/reset-password", (req, res) => {
            resolver_1.authController.resetPassword(req, res);
        });
    }
}
exports.AuthRoutes = AuthRoutes;
