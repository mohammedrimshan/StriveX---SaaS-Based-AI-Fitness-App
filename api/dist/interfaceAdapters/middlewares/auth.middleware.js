"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.authorizeRole = exports.verifyAuth = void 0;
const jwt_service_1 = require("../services/jwt.service");
const constants_1 = require("../../shared/constants");
const redis_client_1 = __importDefault(require("../../frameworks/cache/redis.client"));
const tokenService = new jwt_service_1.JWTService();
const verifyAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = extractToken(req);
        console.log("Token extracted:", extractToken(req));
        if (!token) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
            });
            return;
        }
        if (yield isBlacklisted(token.access_token)) {
            res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: constants_1.ERROR_MESSAGES.TOKEN_BLACKLISTED,
            });
            return;
        }
        const user = tokenService.verifyAccessToken(token.access_token);
        console.log("User after verification:", user);
        if (!user || !user.id) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                message: constants_1.ERROR_MESSAGES.TOKEN_EXPIRED,
            });
            return;
        }
        req.user = Object.assign(Object.assign({}, user), { access_token: token.access_token, refresh_token: token.refresh_token });
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            console.log(error.name);
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                message: constants_1.ERROR_MESSAGES.TOKEN_EXPIRED,
            });
            return;
        }
        console.log("Invalid token response sent");
        res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            message: constants_1.ERROR_MESSAGES.INVALID_TOKEN,
        });
        return;
    }
});
exports.verifyAuth = verifyAuth;
const extractToken = (req) => {
    var _a, _b, _c, _d;
    const userType = req.path.split("/")[1];
    if (!userType)
        return null;
    return {
        access_token: (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[`${userType}_access_token`]) !== null && _b !== void 0 ? _b : null,
        refresh_token: (_d = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c[`${userType}_refresh_token`]) !== null && _d !== void 0 ? _d : null,
    };
};
const isBlacklisted = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield redis_client_1.default.get(token);
        return result !== null;
    }
    catch (error) {
        console.error("Redis error:", error);
        return false;
    }
});
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        console.log(user.role);
        if (!user || !allowedRoles.includes(user.role)) {
            res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: constants_1.ERROR_MESSAGES.NOT_ALLOWED,
                userRole: user ? user.role : "none",
            });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
const decodeToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = extractToken(req);
        if (!token) {
            console.log("no token");
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                message: constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
            });
            return;
        }
        if (yield isBlacklisted(token.access_token)) {
            console.log("token is black listed is worked");
            res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                message: constants_1.ERROR_MESSAGES.TOKEN_BLACKLISTED,
            });
            return;
        }
        const user = tokenService.decodeAccessToken(token === null || token === void 0 ? void 0 : token.access_token);
        console.log("decoded", user);
        req.user = {
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
            role: user === null || user === void 0 ? void 0 : user.role,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
        };
        next();
    }
    catch (error) { }
});
exports.decodeToken = decodeToken;
