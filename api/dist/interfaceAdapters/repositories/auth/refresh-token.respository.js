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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const refresh_token_model_1 = require("@/frameworks/database/mongoDB/models/refresh-token.model");
class RefreshTokenRepository {
    save(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield refresh_token_model_1.RefreshTokenModel.create({
                token: data.token,
                userType: data.userType,
                user: data.user,
                expiresAt: data.expiresAt,
            });
        });
    }
    revokeRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield refresh_token_model_1.RefreshTokenModel.deleteOne({ token });
        });
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
