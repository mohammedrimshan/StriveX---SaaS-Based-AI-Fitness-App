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
exports.BlackListTokenUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let BlackListTokenUseCase = class BlackListTokenUseCase {
    constructor(_redisTokenRepository, _tokenService) {
        this._redisTokenRepository = _redisTokenRepository;
        this._tokenService = _tokenService;
    }
    execute(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = this._tokenService.verifyAccessToken(token);
            if (!decoded || typeof decoded === "string" || !decoded.exp) {
                throw new Error("Invalid Token: Missing expiration time");
            }
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            if (expiresIn > 0) {
                yield this._redisTokenRepository.blackListToken(token, expiresIn);
            }
        });
    }
};
exports.BlackListTokenUseCase = BlackListTokenUseCase;
exports.BlackListTokenUseCase = BlackListTokenUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IRedisTokenRepository")),
    __param(1, (0, tsyringe_1.inject)("ITokenService")),
    __metadata("design:paramtypes", [Object, Object])
], BlackListTokenUseCase);
