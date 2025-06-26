"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
// D:\StriveX\api\src\interfaceAdapters\services\jwt.service.ts
const tsyringe_1 = require("tsyringe");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../shared/config");
let JWTService = class JWTService {
    constructor() {
        this.accessSecret = config_1.config.jwt.ACCESS_SECRET_KEY;
        this.accessExpiresIn = config_1.config.jwt.ACCESS_EXPIRES_IN;
        this.refreshSecret = config_1.config.jwt.REFRESH_SECRET_KEY;
        this.refreshExpiresIn = config_1.config.jwt.REFRESH_EXPIRES_IN;
        this.resetSecret = config_1.config.jwt.RESET_SECRET_KEY;
        this.resetExpiresIn = config_1.config.jwt.RESET_EXPIRES_IN;
    }
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiresIn,
        });
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiresIn,
        });
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.accessSecret);
        }
        catch (error) {
            console.error("Access token verification failed:", error);
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.refreshSecret);
        }
        catch (error) {
            console.error("Refresh token verification failed:", error);
            return null;
        }
    }
    decodeAccessToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            console.error("Access token decoding failed", error);
            return null;
        }
    }
    generateResetToken(email, role) {
        return jsonwebtoken_1.default.sign({ email, role }, this.resetSecret, {
            expiresIn: this.resetExpiresIn,
        });
    }
    verifyResetToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.resetSecret);
        }
        catch (error) {
            console.error("Reset token verification failed:", error);
            return null;
        }
    }
    decodeResetToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            console.error("Reset token decoding failed", error);
            return null;
        }
    }
};
exports.JWTService = JWTService;
exports.JWTService = JWTService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], JWTService);
