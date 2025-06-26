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
exports.ClientRegisterStrategy = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const uniqueuid_bcrypt_1 = require("@/frameworks/security/uniqueuid.bcrypt");
let ClientRegisterStrategy = class ClientRegisterStrategy {
    constructor(clientRepository, passwordBcrypt) {
        this._clientRepository = clientRepository;
        this._passwordBcrypt = passwordBcrypt;
    }
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role !== "client") {
                throw new custom_error_1.CustomError("Invalid role for client registration", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const existingClient = yield this._clientRepository.findByEmail(user.email);
            if (existingClient) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.EMAIL_EXISTS, constants_1.HTTP_STATUS.CONFLICT);
            }
            const { firstName, lastName, email, password, phoneNumber, googleId } = user;
            let hashedPassword = password ? yield this._passwordBcrypt.hash(password) : "";
            const clientId = (0, uniqueuid_bcrypt_1.generateUniqueId)("client");
            const isGoogleAuth = !!googleId;
            const finalPassword = isGoogleAuth ? undefined : hashedPassword !== null && hashedPassword !== void 0 ? hashedPassword : "";
            const finalPhoneNumber = phoneNumber || (isGoogleAuth ? undefined : "");
            const savedClient = yield this._clientRepository.save({
                firstName,
                lastName,
                email,
                password: finalPassword,
                clientId,
                phoneNumber: finalPhoneNumber,
                role: "client",
                googleId: googleId || undefined,
            });
            if (!savedClient) {
                return null;
            }
            return savedClient;
        });
    }
};
exports.ClientRegisterStrategy = ClientRegisterStrategy;
exports.ClientRegisterStrategy = ClientRegisterStrategy = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("IPasswordBcrypt")),
    __metadata("design:paramtypes", [Object, Object])
], ClientRegisterStrategy);
