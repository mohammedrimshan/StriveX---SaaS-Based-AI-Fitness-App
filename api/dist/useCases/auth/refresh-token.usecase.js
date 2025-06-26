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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../entities/utils/custom.error");
const constants_1 = require("../../shared/constants");
let RefreshTokenUseCase = class RefreshTokenUseCase {
    constructor(_tokenService) {
        this._tokenService = _tokenService;
    }
    execute(refreshToken) {
        const payload = this._tokenService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_TOKEN, constants_1.HTTP_STATUS.BAD_REQUEST);
        }
        return {
            role: payload.role,
            accessToken: this._tokenService.generateAccessToken({
                id: payload.id,
                email: payload.email,
                role: payload.role,
            }),
        };
    }
};
exports.RefreshTokenUseCase = RefreshTokenUseCase;
exports.RefreshTokenUseCase = RefreshTokenUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ITokenService")),
    __metadata("design:paramtypes", [Object])
], RefreshTokenUseCase);
