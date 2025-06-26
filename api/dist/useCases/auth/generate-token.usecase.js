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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateTokenUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let GenerateTokenUseCase = class GenerateTokenUseCase {
    constructor(_tokenService, _refreshTokenRepository) {
        this._tokenService = _tokenService;
        this._refreshTokenRepository = _refreshTokenRepository;
    }
    execute(id, email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = { id, email, role };
            const accessToken = this._tokenService.generateAccessToken(payload);
            const refreshToken = this._tokenService.generateRefreshToken(payload);
            yield this._refreshTokenRepository.save({
                token: refreshToken,
                userType: role,
                user: id,
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            });
            return {
                accessToken,
                refreshToken,
            };
        });
    }
};
exports.GenerateTokenUseCase = GenerateTokenUseCase;
exports.GenerateTokenUseCase = GenerateTokenUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ITokenService")),
    __param(1, (0, tsyringe_1.inject)("IRefreshTokenRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GenerateTokenUseCase);
