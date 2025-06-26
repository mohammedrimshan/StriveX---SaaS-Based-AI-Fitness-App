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
exports.ResetPasswordUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
const custom_error_1 = require("@/entities/utils/custom.error");
let ResetPasswordUseCase = class ResetPasswordUseCase {
    constructor(_clientRepository, _trainerRepository, _adminRepository, _tokenService, _redisTokenRepository, _passwordBcrypt) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
        this._adminRepository = _adminRepository;
        this._tokenService = _tokenService;
        this._redisTokenRepository = _redisTokenRepository;
        this._passwordBcrypt = _passwordBcrypt;
    }
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ password, role, token, }) {
            var _b, _c;
            console.log("\n======== Reset Password Use Case Started ========");
            console.log(`Received Data -> Password: [HIDDEN], Role: ${role}, Token: ${token.substring(0, 10)}...`);
            const payload = this._tokenService.verifyResetToken(token);
            console.log("Decoded Token Payload:", payload);
            if (!payload || !payload.email) {
                console.error("❌ Invalid token - Missing email");
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_TOKEN, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const email = payload.email;
            const roleToUse = payload.role || role;
            console.log(`Extracted Email from Token: ${email}`);
            console.log(`Using Role: ${roleToUse} (Token: ${payload.role}, Request: ${role})`);
            let repository;
            if (roleToUse === "client") {
                repository = this._clientRepository;
            }
            else if (roleToUse === "trainer") {
                repository = this._trainerRepository;
            }
            else if (roleToUse === "admin") {
                repository = this._adminRepository;
            }
            else {
                console.error(`❌ Invalid Role Provided: ${roleToUse}`);
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ROLE, constants_1.HTTP_STATUS.FORBIDDEN);
            }
            console.log(`Selected Repository: ${repository.constructor.name}`);
            // Find the user by email
            const user = yield repository.findByEmail(email);
            console.log("User Retrieved from Database:", user);
            if (!user) {
                console.error(`❌ User not found with email: ${email}`);
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            // Verify token validity from Redis
            const tokenValid = yield this._redisTokenRepository.verifyResetToken((_b = user.id) !== null && _b !== void 0 ? _b : "", token);
            console.log(`Token Valid in Redis: ${tokenValid}`);
            if (!tokenValid) {
                console.error("❌ Reset Token is Invalid or Expired");
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_TOKEN, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Compare new password with old one
            const isSamePasswordAsOld = yield this._passwordBcrypt.compare(password, user.password);
            console.log(`Password Match with Old: ${isSamePasswordAsOld}`);
            if (isSamePasswordAsOld) {
                console.error("❌ New password cannot be the same as the old password");
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Hash the new password
            const hashedPassword = yield this._passwordBcrypt.hash(password);
            console.log(`New Password Hashed: ${hashedPassword.substring(0, 10)}...`);
            yield repository.updateByEmail(email, { password: hashedPassword });
            console.log("✅ Password successfully updated in the database");
            yield this._redisTokenRepository.deleteResetToken((_c = user.id) !== null && _c !== void 0 ? _c : "");
            console.log("✅ Reset token deleted from Redis");
            console.log("======== Reset Password Use Case Completed ========");
        });
    }
};
exports.ResetPasswordUseCase = ResetPasswordUseCase;
exports.ResetPasswordUseCase = ResetPasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IAdminRepository")),
    __param(3, (0, tsyringe_1.inject)("ITokenService")),
    __param(4, (0, tsyringe_1.inject)("IRedisTokenRepository")),
    __param(5, (0, tsyringe_1.inject)("IPasswordBcrypt")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ResetPasswordUseCase);
