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
exports.ChangeUserPasswordUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
const custom_error_1 = require("@/entities/utils/custom.error");
let ChangeUserPasswordUseCase = class ChangeUserPasswordUseCase {
    constructor(_clientRepository, _trainerRepository, _adminRepository, _passwordBcrypt) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
        this._adminRepository = _adminRepository;
        this._passwordBcrypt = _passwordBcrypt;
    }
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ oldPassword, newPassword, email, role, }) {
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
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ROLE, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const user = yield repository.findByEmail(email);
            if (!user) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const isCorrectOldPassword = yield this._passwordBcrypt.compare(oldPassword, user.password);
            if (!isCorrectOldPassword) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.WRONG_CURRENT_PASSWORD, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (oldPassword === newPassword) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const hashedNewPassword = yield this._passwordBcrypt.hash(newPassword);
            yield repository.updateByEmail(email, { password: hashedNewPassword });
        });
    }
};
exports.ChangeUserPasswordUseCase = ChangeUserPasswordUseCase;
exports.ChangeUserPasswordUseCase = ChangeUserPasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IAdminRepository")),
    __param(3, (0, tsyringe_1.inject)("IPasswordBcrypt")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ChangeUserPasswordUseCase);
