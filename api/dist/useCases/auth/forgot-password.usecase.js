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
exports.ForgotPasswordUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const config_1 = require("@/shared/config");
let ForgotPasswordUseCase = class ForgotPasswordUseCase {
    constructor(_clientRepository, _trainerRepository, _adminRepository, _tokenService, _redisTokenRepository, _emailService) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
        this._adminRepository = _adminRepository;
        this._tokenService = _tokenService;
        this._redisTokenRepository = _redisTokenRepository;
        this._emailService = _emailService;
    }
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, role }) {
            var _b;
            let repository;
            if (role === "client") {
                repository = this._clientRepository;
            }
            else if (role === "trainer") {
                repository = this._trainerRepository;
            }
            else if (role === "admin") {
                repository = this._adminRepository;
            }
            else {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ROLE, constants_1.HTTP_STATUS.FORBIDDEN);
            }
            const user = yield repository.findByEmail(email);
            if (!user) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.EMAIL_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const resetToken = this._tokenService.generateResetToken(email, role);
            try {
                yield this._redisTokenRepository.storeResetToken((_b = user.id) !== null && _b !== void 0 ? _b : "", resetToken);
            }
            catch (error) {
                console.error("Failed to store reset token in Redis:", error);
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SERVER_ERROR, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            const resetUrl = new URL(`/reset-password/${resetToken}`, config_1.config.cors.ALLOWED_ORIGIN).toString();
            yield this._emailService.sendResetEmail(email, "StriveX - Change your password", resetUrl);
        });
    }
};
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
exports.ForgotPasswordUseCase = ForgotPasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IAdminRepository")),
    __param(3, (0, tsyringe_1.inject)("ITokenService")),
    __param(4, (0, tsyringe_1.inject)("IRedisTokenRepository")),
    __param(5, (0, tsyringe_1.inject)("IEmailService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ForgotPasswordUseCase);
